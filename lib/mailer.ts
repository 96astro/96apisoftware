import nodemailer from "nodemailer";

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  if (!host || !user || !pass || !from) {
    throw new Error("SMTP environment variables are not fully configured.");
  }

  return { host, port, user, pass, from };
}

export async function sendPasswordResetEmail(input: {
  to: string;
  resetUrl: string;
}) {
  const { host, port, user, pass, from } = getSmtpConfig();

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const info = await transporter.sendMail({
    from,
    to: input.to,
    subject: "Reset your password",
    text: `Click this link to reset your password: ${input.resetUrl}`,
    html: `
      <p>You requested a password reset.</p>
      <p><a href="${input.resetUrl}">Reset your password</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  });

  return info.messageId;
}

export async function sendVerificationEmail(input: {
  to: string;
  verifyUrl: string;
}) {
  const { host, port, user, pass, from } = getSmtpConfig();

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const info = await transporter.sendMail({
    from,
    to: input.to,
    subject: "Verify your email",
    text: `Click this link to verify your account: ${input.verifyUrl}`,
    html: `
      <p>Welcome! Please verify your email address.</p>
      <p><a href="${input.verifyUrl}">Verify your email</a></p>
      <p>If you did not create this account, you can ignore this email.</p>
    `,
  });

  return info.messageId;
}
