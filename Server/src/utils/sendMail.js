import nodemailer from "nodemailer";
export const sendMail = async ({ email, subject, message }) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'snehp316@gmail.com',
                pass: 'aufxmugtoadqhasw',
            },
        });
        await transporter.verify();
        const mailOptions = {
            from: 'snehp316@gmail.com',
            to: email,
            subject,
            html: message,
        };
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully to:", email);
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};
