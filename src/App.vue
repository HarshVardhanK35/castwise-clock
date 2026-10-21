<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { init, watchHostConfig, VERSION as IGNITION_VERSION } from "@castwise/ignition";
import type { ClockAppConfig } from "./clockTypes";
import ClockWidget from "./components/ClockWidget.vue";

// Own console prefix, distinct from Ignition's own "[IGNITION]" logs — so
// devtools makes it obvious which layer (this app vs. the engine) a given
// line came from.
const log = (...args: unknown[]) => console.log("[CLOCK]", ...args);

// Real config comes from DFM over postMessage, not a shared global — DFM
// and this app run on different ports (different origins) while both are
// in dev, and a real deployed app will be on a different origin too, so a
// plain `window.__APP_CONFIG__` global wouldn't be reachable from inside
// this iframe at all. Used only when opened directly (not embedded), since
// there's no host to hand a handshake to in that case.
const DEFAULT_CONFIG: ClockAppConfig = {
  location: { name: "New York", lat: 40.7128, lon: -74.006 },
  timezones: [],
  multiTimezone: false,
  clockStyle: "Digital",
  time: "12h",
  showSeconds: true,
  showDate: true,
  dateFormat: "Numeric",
  font: "Inter",
};

const appConfig = ref<ClockAppConfig>(DEFAULT_CONFIG);
const status = ref<"loading" | "ready">("loading");
let hasLoadedOnce = false;
let unwatchHostConfig: (() => void) | null = null;

// Clock never fetches anything external — it just ticks locally (see
// ClockWidget.vue) — so unlike Weather there's no data-fetch result to
// wait on. init() is still called once, purely so Ignition's own
// lifecycle/logging/VERSION machinery is wired up consistently with every
// other app.
async function activate(config: ClockAppConfig) {
  log(hasLoadedOnce ? "config changed" : "activating for the first time", config);
  appConfig.value = config;
  status.value = "ready";

  if (!hasLoadedOnce) {
    hasLoadedOnce = true;
    await init({ appName: "clock" });
    log(`[CLOCK | E${IGNITION_VERSION}] bootstrap:ready`);
    // Tells whatever's embedding this iframe (DFM's settings-screen preview
    // today, the real player once deployed) that the app has actually
    // rendered something — DFM's loading spinner stops on this.
    log("posting APP_LOAD to parent");
    window.parent?.postMessage({ type: "APP_LOAD" }, "*");
  }
}

onMounted(() => {
  log("mounted");

  if (window.parent === window) {
    log("not embedded — using default config");
    activate(DEFAULT_CONFIG);
  } else {
    log("embedded — sent APP_READY, waiting for host config");
    unwatchHostConfig = watchHostConfig((config) => {
      log("received config from host", config);
      activate(config as unknown as ClockAppConfig);
    });
  }
});

onUnmounted(() => {
  unwatchHostConfig?.();
});
</script>

<template>
  <ClockWidget v-if="status === 'ready'" :config="appConfig" />
</template>
