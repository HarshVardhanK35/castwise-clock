export interface LocationConfig {
  name: string;
  lat: number;
  lon: number;
}

export interface ClockAppConfig {
  // Single-timezone mode only (multiTimezone === false).
  location: LocationConfig | null;
  // Multi-timezone mode only (multiTimezone === true) — up to 3 entries,
  // a slot can be null if that city hasn't been picked yet.
  timezones: (LocationConfig | null)[];
  multiTimezone: boolean;
  clockStyle: "Digital" | "Analog";
  time: "12h" | "24h";
  showSeconds: boolean;
  showDate: boolean;
  dateFormat: "Short" | "Long" | "Numeric";
  font: string;
}

// What ClockWidget actually renders per zone, once a location's lat/lon has
// been resolved to a real IANA timezone and formatted against the current
// instant — see clockTime.ts.
export interface ZoneDisplay {
  city: string;
  hm: string;
  ss: string;
  date: string;
  // Hand rotation degrees for analog mode — 0deg points straight up (12
  // o'clock), matching a real clock face.
  hDeg: number;
  mDeg: number;
  sDeg: number;
}
