export const formatIST = (time) => {
  const date = new Date(time);
  const istOffset = 5.5 * 60; // IST is UTC +5:30
  const local = new Date(date.getTime() + istOffset * 60 * 1000);
  return local.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};


export const getISTTimestamp = (date) => {
  return new Date(
    new Date(date).toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  ).getTime();
};
