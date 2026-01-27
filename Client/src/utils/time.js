// src/utils/time.js

// Format any ISO/UTC string to IST string
export const formatIST = (utcString) => {
  if (!utcString) return "-";
  
  // Parse as UTC
  const date = new Date(utcString);
  
  // Convert to IST using Intl.DateTimeFormat
  const options = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  
  return new Intl.DateTimeFormat("en-IN", options).format(date);
};

// Get IST timestamp in ms (for countdowns)
export const getISTTimestamp = (utcString) => {
  if (!utcString) return 0;
  
  // Get UTC timestamp first
  const utcTime = new Date(utcString).getTime();
  
  // IST offset in ms
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;
  
  return utcTime + IST_OFFSET;
};
