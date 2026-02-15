export const API_URL = (() => {
  if (import.meta.env.DEV && typeof window !== "undefined") {
    return `http://${window.location.hostname}:3000`;
  }
  const env = import.meta.env.VITE_API_URL;
  if (env && typeof env === "string") {
    return env.replace(/\/$/, "");
  }
  if (import.meta.env.DEV) {
    return "http://localhost:3000";
  }
  return "";
})();
