// Always use this instead of new Date()
export const nowUTC = () => new Date();

// Frontend must send ISO string
export const istToUTC = (istISOString: any) => {
  return new Date(istISOString);
};

// For display only
export const utcToIST = (utcDate: any) => {
  return new Date(
    utcDate.toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    })
  );
};
