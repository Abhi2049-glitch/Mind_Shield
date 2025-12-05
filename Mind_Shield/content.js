console.log("MindShield: Content Script Loaded");

const style = document.createElement('style');
style.textContent = `
  .mindshield-mark {
    color: black !important;
    font-weight: bold;
    border-bottom: 2px solid red;
    padding: 2px 4px;
    border-radius: 4px;
    box-shadow: 0 0 10px rgba(255,0,0,0.5);
  }
  /* The Green Safe Glow on the body */
  body.mindshield-safe-mode:before {
  /* Inside content.js const style = ... */

@keyframes shieldPulse {
  0% { box-shadow: inset 0 0 0px #2ecc71; border-width: 0px; }
  50% { box-shadow: inset 0 0 50px #2ecc71; border-width: 10px; }
  100% { box-shadow: inset 0 0 20px #2ecc71; border-width: 8px; }
}

body.mindshield-safe-mode:before {
  content: '';
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  border: 8px solid #2ecc71;
  box-shadow: inset 0 0 20px #2ecc71;
  pointer-events: none;
  z-index: 999998;
  
  /* THE ANIMATION */
  animation: shieldPulse 0.8s ease-out;
}
    content: '';
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    border: 8px solid #2ecc71;
    box-shadow: inset 0 0 20px #2ecc71;
    pointer-events: none; /* Let clicks pass through */
    z-index: 999998;
    animation: fadeIn 0.5s ease-out;
  }
  /* The Toast Notification Container */
  #mindshield-toast-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999999;
  }
  /* The Toast Notification Bubble */
  .mindshield-toast {
    background: #1e1e2e;
    color: #cdd6f4;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: sans-serif;
    animation: slideUp 0.3s ease-out;
    border-left: 4px solid;
  }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`;
document.head.appendChild(style);

// --- MESSAGE HANDLER ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Clear previous effects first
  clearEffects();

  if (request.action === "GET_PAGE_TEXT") {
    sendResponse({ text: document.body.innerText });
  }
  else if (request.action === "HIGHLIGHT_TRIGGERS") {
    console.log("MindShield: Triggers received:", request.triggers);
    highlightPhrases(request.triggers);
  }
  else if (request.action === "HIGHLIGHT_SAFE") {
     console.log("MindShield: Page is safe.");
     applySafeVisuals();
  }
});

// --- HELPER: CLEAR PREVIOUS EFFECTS ---
function clearEffects() {
    document.body.classList.remove('mindshield-safe-mode');
    const existingToast = document.getElementById('mindshield-toast-container');
    if (existingToast) existingToast.remove();
    // Note: We don't remove red highlights on re-scan, it gets messy. Better to refresh.
}


// --- ACTION: APPLY SAFE VISUALS (GREEN) ---
function applySafeVisuals() {
    // 1. Add the green glow border to the body
    document.body.classList.add('mindshield-safe-mode');
    
    // 2. Show a green toast notification
    showToast("✅ MindShield Analysis: No threats detected on this page.", "#2ecc71");

    // Optional: Remove the glow after a few seconds so it's not annoying
    setTimeout(() => {
        document.body.classList.remove('mindshield-safe-mode');
    }, 5000);
}


// --- ACTION: HIGHLIGHT TRIGGERS (RED/YELLOW) ---
function highlightPhrases(triggers) {
  let hitCount = 0;
  const nodesToHighlight = [];

  // 1. Find the nodes
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  let node;
  while (node = walker.nextNode()) {
    triggers.forEach(trigger => {
       const phrase = trigger.phrase.trim();
       if (phrase.length < 2) return;

       if (node.nodeValue.toLowerCase().includes(phrase.toLowerCase())) {
         if (node.parentElement && node.parentElement.tagName !== "SCRIPT" && !node.parentElement.classList.contains('mindshield-mark')) {
            const color = trigger.type === "Urgency" ? "#ff5f5f" : "#facc15";
            nodesToHighlight.push({ node, phrase, color });
         }
       }
    });
  }

  // 2. Apply highlights
  nodesToHighlight.forEach(item => {
      const span = document.createElement('span');
      span.className = "mindshield-mark";
      span.style.backgroundColor = item.color;
      // Use a regex to replace only the exact phrase match within the text node
      const regex = new RegExp(`(${escapeRegExp(item.phrase)})`, 'gi');
      span.innerHTML = item.node.nodeValue.replace(regex, '<span style="background-color:inherit;">$1</span>');
      
      if (item.node.parentNode) {
          item.node.parentNode.replaceChild(span, item.node);
          hitCount++;
      }
  });

  if (hitCount > 0) {
      showToast(`⚠️ MindShield detected ${hitCount} potential triggers.`, "#ff5f5f");
  } else {
      showToast("ℹ️ Threats detected in text, but exact matches were hidden in HTML.", "#facc15");
  }
}

// --- HELPER: SHOW TOAST NOTIFICATION ---
function showToast(message, color) {
    const container = document.createElement('div');
    container.id = "mindshield-toast-container";
    container.innerHTML = `
        <div class="mindshield-toast" style="border-color: ${color}">
            ${message}
        </div>
    `;
    document.body.appendChild(container);
    
    // Remove after 5 seconds
    setTimeout(() => {
        container.remove();
    }, 5000);
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

}
