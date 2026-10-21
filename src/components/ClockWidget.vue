<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import type { ClockAppConfig, ZoneDisplay } from "../clockTypes";
import { resolveZone } from "../clockTime";
import ClockDigital from "./ClockDigital.vue";
import ClockAnalog from "./ClockAnalog.vue";

// Pure rendering component: takes a resolved config and draws the clock(s).
// Knows nothing about Ignition, postMessage, or where `config` came from —
// that wiring lives in App.vue.
const props = defineProps<{ config: ClockAppConfig }>();

const now = ref(new Date());
let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

// Single-timezone mode uses `location`; multi-timezone mode uses up to 3
// `timezones` entries, skipping any slot that hasn't had a city picked yet
// (DFM's settings panel allows an empty slot while adding a 2nd/3rd city).
const activeLocations = computed(() => {
  if (props.config.multiTimezone) {
    return props.config.timezones.filter((loc): loc is NonNullable<typeof loc> => loc !== null);
  }
  return props.config.location ? [props.config.location] : [];
});

const zones = computed<ZoneDisplay[]>(() =>
  activeLocations.value.map((loc) =>
    resolveZone(loc, now.value, { time: props.config.time, dateFormat: props.config.dateFormat }),
  ),
);
</script>

<template>
  <div class="clock-widget" :style="{ fontFamily: config.font }">
    <div v-if="zones.length === 0" class="empty">No location configured yet.</div>

    <div v-else class="zones" :class="{ multi: zones.length > 1 }">
      <div v-for="(zone, i) in zones" :key="i" class="zone">
        <ClockDigital
          v-if="config.clockStyle === 'Digital'"
          :zone="zone"
          :show-seconds="config.showSeconds"
          :show-date="config.showDate"
        />
        <ClockAnalog v-else :zone="zone" :show-date="config.showDate" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.clock-widget {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: #0d1117;
  color: #e6edf3;
  box-sizing: border-box;
}
.empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b949e;
  font-size: 1.1rem;
}
.zones {
  display: flex;
  width: 100%;
  height: 100%;
}
.zones.multi .zone {
  border-left: 1px solid #30363d;
}
.zones.multi .zone:first-child {
  border-left: none;
}
.zone {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  container-type: size;
}
</style>
