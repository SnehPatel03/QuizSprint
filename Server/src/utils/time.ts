export const nowUTC = () => new Date();

export const istToUTC = (istISOString: string) => {
  return new Date(istISOString);
};

export const utcToIST = (utcDate: any) => {
  return new Date(
    utcDate.toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    })
  );
};
