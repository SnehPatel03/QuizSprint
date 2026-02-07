import { generateVerificationCodeEmailTemplate } from "./template";
import { sendMail } from "./sendMail.js";
export async function sendVerificationCode(email, verificationCode) {
    try {
        const message = generateVerificationCodeEmailTemplate(verificationCode);
        await sendMail({
            email,
            subject: "Verification code by Patel.Auth.Co",
            message,
        });
        return true;
    }
    catch (error) {
        console.error("error in sending verification code:", error);
        return false;
    }
}
