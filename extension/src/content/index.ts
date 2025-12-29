// Inject the inpage script
const container = document.head || document.documentElement;
const script = document.createElement('script');
script.src = chrome.runtime.getURL('src/inpage/index.js');
script.setAttribute('async', 'false');
container.insertBefore(script, container.children[0]);
container.removeChild(script);

// Listen for messages from inpage script
window.addEventListener('message', (event) => {
  if (event.source !== window || event.data.source !== 'fakesol-inpage') return;

  // Forward to background script
  chrome.runtime.sendMessage(event.data.data, (response) => {
    // Send response back to inpage script
    window.postMessage({
      source: 'fakesol-content',
      data: {
        method: event.data.data.method,
        result: response?.result,
        error: response?.error,
      },
    }, window.location.origin);
  });
});
