// --- 🔑 GLOBAL API KEY (Accessible by everything) ---
// PASTE YOUR KEY HERE ONCE.
const API_KEY = "API_KEY_IS_HERE".trim(); 
// ----------------------------------------------------

// --- BUTTON 1: SCAN COPIED TEXT ---
document.getElementById('scanBtn').addEventListener('click', async () => {
  const text = document.getElementById('inputText').value;
  const resultDiv = document.getElementById('result');

  // Safety Check
  if (API_KEY === "PASTE_YOUR_KEY_HERE" || API_KEY.length < 10) {
     resultDiv.innerHTML = `<div class="alert" style="border-color:var(--danger); color:var(--danger); text-align:center;">⚠️ Error: Paste API Key in Line 3.</div>`;
     return;
  }

  if (!text.trim()) {
    resultDiv.innerHTML = `<div class="alert" style="border-color:var(--danger); text-align:center; color:var(--danger);">⚠️ Paste text to scan</div>`;
    return;
  }

  // ✅ FIXED LINE: Uses the pulsating animation class
  resultDiv.innerHTML = `<div class="scanning-text">⚡ SCANNING NEURAL PATTERNS...</div>`;

  // Reuse the helper function to scan
  await scanAndRender(text, resultDiv);
});

// --- BUTTON 2: SCAN WEBPAGE (Level 2) ---
document.getElementById('scanPageBtn').addEventListener('click', async () => {
  const resultDiv = document.getElementById('result');
  
  // Safety Check
  if (API_KEY === "PASTE_YOUR_KEY_HERE" || API_KEY.length < 10) {
     resultDiv.innerHTML = `<div class="alert" style="border-color:var(--danger); color:var(--danger); text-align:center;">⚠️ Error: Paste API Key in Line 3.</div>`;
     return;
  }

  resultDiv.innerHTML = `<div class="scanning-text">Reading Page Content...</div>`;

  // 1. Get the active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  try {
      // 2. Send message to content script
      chrome.tabs.sendMessage(tab.id, { action: "GET_PAGE_TEXT" }, async (response) => {
        
        if (chrome.runtime.lastError || !response || !response.text) {
          resultDiv.innerHTML = `<div class="alert" style="color:var(--danger)">❌ Cannot read page. Refresh this tab.</div>`;
          return;
        }

        const pageText = response.text.substring(0, 2000); // Limit to 2000 chars
        resultDiv.innerHTML = `<div class="scanning-text">Analyzing Page Logic...</div>`;
        
        // 3. Scan the text
        const analysis = await scanAndRender(pageText, resultDiv);

        // 4. Highlight based on results
        if (analysis && analysis.triggers && analysis.triggers.length > 0) {
            // THREATS FOUND -> Send Triggers (Red/Yellow)
            chrome.tabs.sendMessage(tab.id, { 
                action: "HIGHLIGHT_TRIGGERS", 
                triggers: analysis.triggers 
            });
        } else if (analysis && (analysis.is_safe || analysis.triggers.length === 0)) {
            // SAFE FOUND -> Send Safe Signal (Green)
            chrome.tabs.sendMessage(tab.id, { 
                action: "HIGHLIGHT_SAFE"
            });
        }
      });
  } catch (e) {
      resultDiv.innerHTML = `<div class="alert" style="color:var(--danger)">❌ Connection failed. Refresh page.</div>`;
  }
});


// --- HELPER: SHARED SCANNING FUNCTION ---
async function scanAndRender(text, container) {
    const prompt = `
    Analyze the text. Return a JSON list of "triggers" found in the text.
    IMPORTANT: The "phrase" must be a SINGLE WORD or a SHORT 2-WORD PHRASE found exactly in the text (e.g. "immediately", "wire money", "suspended").
    Do not return long sentences.
    
    Return STRICT JSON:
    {
      "is_safe": boolean,
      "triggers": [
        {
          "type": "Urgency" | "Fear" | "Authority" | "Scarcity",
          "phrase": "exact short match", 
          "explanation": "short reason"
        }
      ]
    }
    Text: "${text}"
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json();
    let rawText = data.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
    const analysis = JSON.parse(rawText);

    renderResults(analysis, container);
    return analysis;

  } catch (error) {
    console.error(error);
    container.innerHTML = `<div class="alert" style="color:var(--danger)">Scan Failed: ${error.message}</div>`;
    return null;
  }
}

// --- HELPER: RENDER CARDS ---
function renderResults(data, container) {
  container.innerHTML = "";

  if (!data || data.is_safe || data.triggers.length === 0) {
    container.innerHTML = `
      <div class="safe-badge">
        <strong>✅ NO THREATS DETECTED</strong>
        <div style="font-size:0.8rem; margin-top:5px; opacity:0.8">Content appears neutral.</div>
      </div>
    `;
    return;
  }

  data.triggers.forEach(trigger => {
    const div = document.createElement('article');
    div.className = `alert ${trigger.type}`;
    div.innerHTML = `
      <div class="alert-header">
        <strong>${trigger.type}</strong>
        <small style="color:var(--danger)">DETECTED</small>
      </div>
      <span style="margin-top:5px; display:block">"${trigger.phrase}"</span>
      <p>${trigger.explanation}</p>
    `;
    container.appendChild(div);
  });
}