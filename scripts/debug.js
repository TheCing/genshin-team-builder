// Default to development mode if NODE_ENV is undefined
const isDev = process.env.NODE_ENV !== "production";

// Log environment status on startup
console.log("[Debug System] Environment:", {
  NODE_ENV: process.env.NODE_ENV || "development",
  isDev,
});

export function debug(...args) {
  if (isDev) {
    console.log("[Debug]", ...args);
  }
}

export function debugError(...args) {
  if (isDev) {
    console.error("[Debug Error]", ...args);
  }
}
