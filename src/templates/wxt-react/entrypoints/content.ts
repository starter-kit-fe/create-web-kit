export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    console.log("[wxt-react] content script attached:", window.location.href);
  },
});
