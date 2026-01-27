// src/utils/time.js

// Format a given UTC timestamp to IST string
export const formatIST = (time) => {
  if (!time) return "-";
  return new Date(time).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata", // ✅ important
  });
};

// Get IST timestamp (ms since epoch)
export const getISTTimestamp = (date) => {
  if (!date) return null;
  return new Date(
    new Date(date).toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  ).getTime();
};
