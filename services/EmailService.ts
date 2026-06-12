import nodemailer from "nodemailer";

function parseFrom(mailFrom: string): { name: string; email: string } {
  if (mailFrom.includes("<") && mailFrom.includes(">")) {
    const name = mailFrom.split("<")[0].trim();
    const email = mailFrom.split("<")[1].replace(">", "").trim();
    return { name, email };
  }
  return { name: "Portfolio Arbiter", email: mailFrom.trim() };
}

const { name: fromName, email: fromEmail } = parseFrom(
  process.env.MAIL_FROM ?? "Portfolio Arbiter <noreply@portfolioarbiter.com>"
);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "mail.infomaniak.com",
  port: Number(process.env.SMTP_PORT ?? 465),
  secure: Number(process.env.SMTP_PORT ?? 465) === 465,
  auth: {
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASSWORD ?? "",
  },
});

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  replyTo?: string
): Promise<void> {
  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  });
}
