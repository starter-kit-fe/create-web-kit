export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    console.log("[wxt-react] extension installed");
  });
});
