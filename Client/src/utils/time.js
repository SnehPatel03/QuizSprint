export const formatIST = (date) => {
  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export const getISTTimestamp = (date) => {
  return new Date(
    new Date(date).toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  ).getTime();
};
