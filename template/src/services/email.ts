// @services/email.ts
import nodemailer from "nodemailer";
import { envs } from "@config/vars";
import emails from "@utils/data/emails.json";


type EmailTemplates = {
  [key: string]: { subject: string; text: string };
};

const emailTemplates: EmailTemplates = emails;


const transporter = nodemailer.createTransport({
  host: envs.smtpHost,
  secure: true,
  auth: {
    user: envs.smtpUser,
    pass: envs.smtpPass,
  },
});

const sendVerificationEmail = async (email: string, code: string,language:string) => {
  let mailOptions;
  
  const emailTemplate : {subject:string,text:string} = emailTemplates[language];
  const smtpUser = envs.smtpUser ? envs.smtpUser.split('@')[0] : "defaultUser";
    mailOptions = {
      from: `"${smtpUser}" <${envs.smtpUser}>`,
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.text.replace("{{code}}", code),
    };
  await transporter.sendMail(mailOptions);
};

export const emailService = {
  sendVerificationEmail,
};
