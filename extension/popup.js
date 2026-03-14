const STORAGE_KEY = "clearsight_host";
const DEFAULT_HOST = "http://localhost:3000";

const urlEl = document.getElementById("current-url");
const hostInput = document.getElementById("host-input");
const scanBtn = document.getElementById("scan-btn");
const errorMsg = document.getElementById("error-msg");

let currentUrl = "";

// Load saved host
chrome.storage.local.get(STORAGE_KEY, (result) => {
  hostInput.value = result[STORAGE_KEY] || DEFAULT_HOST;
});

// Save host on change
hostInput.addEventListener("input", () => {
  chrome.storage.local.set({ [STORAGE_KEY]: hostInput.value.trim() });
});

// Get current tab URL
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]?.url) {
    currentUrl = tabs[0].url;
    urlEl.textContent = currentUrl;
  } else {
    urlEl.textContent = "Unable to read page URL";
    scanBtn.disabled = true;
  }
});

// Scan button
scanBtn.addEventListener("click", () => {
  const host = hostInput.value.trim().replace(/\/+$/, "");

  if (!host) {
    showError("Please enter the ClearSight host URL");
    return;
  }

  if (!currentUrl || currentUrl.startsWith("chrome://") || currentUrl.startsWith("chrome-extension://")) {
    showError("Cannot scan browser internal pages");
    return;
  }

  const scanUrl = `${host}/?autoScan=${encodeURIComponent(currentUrl)}`;
  chrome.tabs.create({ url: scanUrl });
  window.close();
});

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.add("visible");
  setTimeout(() => errorMsg.classList.remove("visible"), 3000);
}
