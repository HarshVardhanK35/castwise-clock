<script setup lang="ts">
import type { ZoneDisplay } from "../clockTypes";

defineProps<{
  zone: ZoneDisplay;
  showDate: boolean;
}>();

// Places hour-marker i (1-12) at radius r from center, as percentage
// coordinates — i*30deg per hour, measured clockwise from 12 o'clock
// (hence sin for x, -cos for y).
function pos(i: number, r: number): [number, number] {
  const a = (i * Math.PI) / 6;
  return [+(50 + r * Math.sin(a)).toFixed(2), +(50 - r * Math.cos(a)).toFixed(2)];
}

const NUMERALS = Array.from({ length: 12 }, (_, k) => {
  const i = k + 1;
  const [ax, ay] = pos(i, 38);
  return { n: i, ax, ay };
});
</script>

<template>
  <div class="clock-analog">
    <div class="city">{{ zone.city }}</div>
    <div class="face">
      <span
        v-for="n in NUMERALS"
        :key="n.n"
        class="numeral"
        :style="{ left: n.ax + '%', top: n.ay + '%' }"
      >{{ n.n }}</span>
      <div class="hand hour" :style="{ transform: `rotate(${zone.hDeg}deg)` }" />
      <div class="hand minute" :style="{ transform: `rotate(${zone.mDeg}deg)` }" />
      <div class="hand second" :style="{ transform: `rotate(${zone.sDeg}deg)` }" />
      <div class="center-dot" />
    </div>
    <div v-if="showDate" class="date">{{ zone.date }}</div>
  </div>
</template>

<style scoped>
.clock-analog {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(4px, 3.5cqh, 18px);
  padding: 4cqmin;
  text-align: center;
  box-sizing: border-box;
}
.city {
  font-size: clamp(9px, min(4.2cqw, 4.4cqh), 15px);
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #8b949e;
  text-wrap: balance;
}
.face {
  position: relative;
  flex: none;
  width: min(60cqw, 60cqh);
  height: min(60cqw, 60cqh);
  container-type: size;
  border-radius: 50%;
  background: #161b22;
  border: 1px solid #30363d;
}
.numeral {
  position: absolute;
  transform: translate(-50%, -50%);
  font-size: 8.5cqw;
  font-weight: 500;
  line-height: 1;
  color: #e6edf3;
}
.hand {
  position: absolute;
  left: 50%;
  bottom: 50%;
  border-radius: 2cqw;
  transform-origin: 50% 100%;
}
.hand.hour {
  width: 2.6cqw;
  margin-left: -1.3cqw;
  height: 24cqw;
  background: #e6edf3;
}
.hand.minute {
  width: 1.6cqw;
  margin-left: -0.8cqw;
  height: 35cqw;
  background: #e6edf3;
}
.hand.second {
  width: 0.8cqw;
  margin-left: -0.4cqw;
  height: 39cqw;
  background: #2f81f7;
}
.center-dot {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 4cqw;
  height: 4cqw;
  margin: -2cqw 0 0 -2cqw;
  border-radius: 50%;
  background: #2f81f7;
}
.date {
  font-size: clamp(10px, min(5.4cqw, 5.4cqh), 20px);
  font-weight: 400;
  color: #8b949e;
  text-wrap: balance;
}
</style>
