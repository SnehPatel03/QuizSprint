// src/utils/time.js

/**
 * Converts any UTC/ISO date string or Date object to IST string
 * Output format: "28 Jan 2026, 01:09 PM"
 */ 
export const formatIST = (time) => {
  if (!time) return "-";

  const date = new Date(time);
  if (isNaN(date.getTime())) return "-";

  // IST offset in minutes
  const istOffset = 330; // 5*60 + 30
  const istTime = new Date(date.getTime() + istOffset * 60 * 1000);

  const day = String(istTime.getUTCDate()).padStart(2, "0");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[istTime.getUTCMonth()];
  const year = istTime.getUTCFullYear();

  let hours = istTime.getUTCHours();
  const minutes = String(istTime.getUTCMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // handle midnight as 12
  const strHours = String(hours).padStart(2, "0");

  return `${day} ${month} ${year}, ${strHours}:${minutes} ${ampm}`;
};

/**
 * Returns IST timestamp in milliseconds
 * Converts any UTC/ISO date string or Date object to IST timestamp
 */
export const getISTTimestamp = (time) => {
  if (!time) return 0;
  const date = new Date(time);
  if (isNaN(date.getTime())) return 0;

  const istOffset = 330; // 5*60 + 30
  return date.getTime() + istOffset * 60 * 1000;
};
