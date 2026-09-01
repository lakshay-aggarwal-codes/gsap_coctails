import nodemailer from "nodemailer";

let transporter = null;
const testMailbox = [];

const isSmtpConfigured = () =>
    Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    return transporter;
};
const sendMail = async ({ to, subject, html, text }) => {
    if (process.env.NODE_ENV === "test") {
        testMailbox.push({ to, subject, html, text });
        return { delivered: false, reason: "test-env" };
    }

    if (!isSmtpConfigured()) {
        console.log(
            `\n[mailer] SMTP not configured — logging email instead of sending:\n  To: ${to}\n  Subject: ${subject}\n  ${text || html}\n`
        );
        return { delivered: false, reason: "smtp-not-configured" };
    }

    await getTransporter().sendMail({
        from: process.env.SMTP_FROM || "Velvet Pour <no-reply@velvetpour.local>",
        to,
        subject,
        html,
        text,
    });

    return { delivered: true };
};

const getTestMailbox = () => testMailbox;
const clearTestMailbox = () => {
    testMailbox.length = 0;
};

export default sendMail;
export { isSmtpConfigured, getTestMailbox, clearTestMailbox };
