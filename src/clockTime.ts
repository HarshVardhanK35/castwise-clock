import tzLookup from "tz-lookup";
import type { ClockAppConfig, LocationConfig, ZoneDisplay } from "./clockTypes";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// Reads a location's actual local hour/minute/second at `now`, via its real
// IANA timezone (resolved from lat/lon — see tzLookup below) rather than
// manual UTC-offset math, so DST is handled automatically by the browser's
// own Intl implementation.
function getTimeParts(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(now);

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { hour: get("hour"), minute: get("minute"), second: get("second") };
}

const DATE_FORMAT_OPTIONS: Record<ClockAppConfig["dateFormat"], Intl.DateTimeFormatOptions> = {
  Short: { weekday: "short", month: "short", day: "numeric", year: "numeric" },
  Long: { weekday: "long", month: "long", day: "numeric", year: "numeric" },
  Numeric: { month: "2-digit", day: "2-digit", year: "numeric" },
};

// Resolves one configured location into everything ClockWidget needs to
// render it, at the given instant `now`. Called once per zone, every tick.
export function resolveZone(
  location: LocationConfig,
  now: Date,
  config: Pick<ClockAppConfig, "time" | "dateFormat">,
): ZoneDisplay {
  // lat/lon -> a real IANA timezone name (e.g. "Europe/London") — a pure,
  // offline lookup (no network call, no API key), the same mechanism
  // discussed for this feature from the start.
  const timeZone = tzLookup(location.lat, location.lon);
  const { hour, minute, second } = getTimeParts(now, timeZone);

  const displayHour = config.time === "12h" ? hour % 12 || 12 : hour;
  const hourStr = config.time === "12h" ? String(displayHour) : pad(displayHour);
  const hm = `${hourStr}:${pad(minute)}`;

  const date = new Intl.DateTimeFormat("en-US", {
    timeZone,
    ...DATE_FORMAT_OPTIONS[config.dateFormat],
  }).format(now);

  // Hand rotation degrees — always a real analog reading of the actual
  // time, independent of the 12h/24h display setting (that only changes
  // the digital readout's text, never the physical hand positions).
  const hourFraction = (hour % 12) + minute / 60;
  const hDeg = hourFraction * 30; // 360deg / 12h
  const mDeg = (minute + second / 60) * 6; // 360deg / 60min
  const sDeg = second * 6; // 360deg / 60sec

  return { city: location.name, hm, ss: pad(second), date, hDeg, mDeg, sDeg };
}
