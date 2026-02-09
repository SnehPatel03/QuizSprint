import { generateVerificationCodeEmailTemplate } from "./template";
import { sendMail } from "./sendMail";

export async function sendVerificationCode(email: string, verificationCode:number | string) {
  try {
    const message = generateVerificationCodeEmailTemplate(verificationCode);
    return await sendMail({
    email,
    subject: "Verify your QuizSprint account",
    message,
  });

    return true;
  } catch (error) {
    console.error("error in sending verification code:", error);
    return false;
  }
}