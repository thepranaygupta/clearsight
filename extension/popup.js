const HOST = "http://localhost:3000";

const urlEl = document.getElementById("current-url");
const scanBtn = document.getElementById("scan-btn");
const scanBtnText = document.getElementById("scan-btn-text");
const scanBtnIcon = document.getElementById("scan-btn-icon");
const scanBtnSpinner = document.getElementById("scan-btn-spinner");
const errorMsg = document.getElementById("error-msg");

let currentUrl = "";

// Get current tab URL
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]?.url) {
    currentUrl = tabs[0].url;
    urlEl.textContent = truncateUrl(currentUrl);
    urlEl.title = currentUrl;

    if (!isAllowed(currentUrl)) {
      urlEl.classList.add("blocked");
      scanBtn.disabled = true;
      showError("This page cannot be scanned");
    }
  } else {
    urlEl.textContent = "Unable to read page URL";
    scanBtn.disabled = true;
  }
});

// Scan button
scanBtn.addEventListener("click", () => {
  if (!currentUrl || !isAllowed(currentUrl)) {
    showError("Cannot scan this page");
    return;
  }

  setLoading(true);

  const scanUrl = `${HOST}/dashboard?autoScan=${encodeURIComponent(currentUrl)}`;
  chrome.tabs.create({ url: scanUrl });

  setTimeout(() => window.close(), 150);
});

function truncateUrl(url, max = 80) {
  if (url.length <= max) return url;
  // Cut at last "/" before the limit for a cleaner break
  const cut = url.lastIndexOf("/", max - 3);
  const breakAt = cut > 10 ? cut : max - 3;
  return url.slice(0, breakAt) + "...";
}

function isAllowed(url) {
  const lower = url.toLowerCase();
  return lower.startsWith("http://") || lower.startsWith("https://");
}

function setLoading(loading) {
  scanBtn.disabled = loading;
  scanBtnText.textContent = loading ? "Opening..." : "Scan This Page";
  scanBtnIcon.style.display = loading ? "none" : "block";
  scanBtnSpinner.style.display = loading ? "block" : "none";
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.add("visible");
  setTimeout(() => errorMsg.classList.remove("visible"), 3000);
}
