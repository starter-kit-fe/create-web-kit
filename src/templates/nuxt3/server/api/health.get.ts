export default defineEventHandler(() => {
  return {
    status: "ok",
    service: "nuxt3",
    time: new Date().toISOString(),
  };
});
