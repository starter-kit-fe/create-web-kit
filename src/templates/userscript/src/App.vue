<script setup lang="ts">
import { computed, ref } from "vue";

const expanded = ref(false);

const hostname = computed(() => window.location.hostname);
const currentUrl = computed(() => window.location.href);

function toggleExpanded(): void {
  expanded.value = !expanded.value;
}

function logCurrentUrl(): void {
  console.log("[userscript] current url:", currentUrl.value);
}
</script>

<template>
  <section class="panel" :class="{ expanded }">
    <button class="panel__toggle" type="button" @click="toggleExpanded">
      {{ expanded ? "收起" : "Userscript" }}
    </button>

    <div v-if="expanded" class="panel__body">
      <p class="panel__title">Userscript Ready</p>
      <p class="panel__meta">{{ hostname }}</p>
      <button class="panel__action" type="button" @click="logCurrentUrl">
        打印当前地址
      </button>
    </div>
  </section>
</template>

<style scoped>
.panel {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 2147483647;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  font-family:
    "SF Pro Display",
    "PingFang SC",
    "Helvetica Neue",
    sans-serif;
}

.panel__toggle,
.panel__action {
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.panel__toggle {
  padding: 10px 14px;
  background: linear-gradient(135deg, #111827, #1f2937);
  color: #fff;
  box-shadow: 0 16px 40px rgba(17, 24, 39, 0.24);
}

.panel__body {
  min-width: 220px;
  padding: 14px;
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.94);
  color: #111827;
  box-shadow: 0 20px 40px rgba(17, 24, 39, 0.18);
  backdrop-filter: blur(10px);
}

.panel__title {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 800;
}

.panel__meta {
  margin: 0 0 12px;
  color: #6b7280;
  font-size: 12px;
}

.panel__action {
  padding: 8px 12px;
  background: #f59e0b;
  color: #111827;
}
</style>
