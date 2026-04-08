<template>
  <main class="page-shell">
    <section class="hero-card">
      <p class="eyebrow">Nuxt 3 Flow</p>
      <h1>SSR-first Vue setup with room for real product work.</h1>
      <p class="body-copy">
        This starter keeps the official Nuxt scaffold and adds Nuxt UI, Pinia,
        VueUse, runtime config defaults, and a tiny server route so the project
        starts from a practical baseline.
      </p>
      <div class="meta-grid">
        <div>
          <span class="meta-label">Rendering</span>
          <strong>SSR enabled</strong>
        </div>
        <div>
          <span class="meta-label">API Base</span>
          <strong>{{ config.public.apiBase }}</strong>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
</script>

<style scoped>
.page-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
}

.hero-card {
  width: min(720px, 100%);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 28px;
  padding: 2rem;
  background: rgba(15, 23, 42, 0.82);
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.4);
}

.eyebrow {
  margin: 0 0 1rem;
  color: #6ee7b7;
  text-transform: uppercase;
  letter-spacing: 0.24em;
  font-size: 0.75rem;
}

h1 {
  margin: 0;
  font-size: clamp(2.2rem, 5vw, 4rem);
  line-height: 1.05;
}

.body-copy {
  margin: 1.5rem 0 0;
  font-size: 1rem;
  line-height: 1.75;
  color: rgba(226, 232, 240, 0.82);
}

.meta-grid {
  margin-top: 2rem;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.meta-label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.8rem;
  color: rgba(148, 163, 184, 0.95);
}
</style>
