export const generateVerificationCode = () => {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); 

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); 

  return {
    code,
    expiresAt,
  };
};
