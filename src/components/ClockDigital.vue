<script setup lang="ts">
import type { ZoneDisplay } from "../clockTypes";

defineProps<{
  zone: ZoneDisplay;
  showSeconds: boolean;
  showDate: boolean;
}>();
</script>

<template>
  <div class="clock-digital">
    <div class="city">{{ zone.city }}</div>
    <div class="time">
      {{ zone.hm }}<span v-if="showSeconds" class="seconds">:{{ zone.ss }}</span>
    </div>
    <div v-if="showDate" class="date">{{ zone.date }}</div>
  </div>
</template>

<style scoped>
/* Fills whatever box the parent gives it (a single clock, or one half of
   "Both" mode, or one slot in a multi-timezone row) — sizing is entirely
   the parent's responsibility via container-type:size further up. */
.clock-digital {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(4px, 3cqh, 16px);
  padding: 6cqw;
  text-align: center;
  box-sizing: border-box;
}
.city {
  font-size: clamp(14px, min(7cqw, 7.2cqh), 30px);
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #8b949e;
  text-wrap: balance;
}
.time {
  font-size: min(19cqw, 30cqh);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  color: #e6edf3;
  white-space: nowrap;
}
.seconds {
  color: #8b949e;
}
.date {
  font-size: clamp(13px, min(6.8cqw, 6.8cqh), 26px);
  font-weight: 400;
  color: #8b949e;
  text-wrap: balance;
}
</style>
