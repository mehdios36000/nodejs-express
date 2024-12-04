import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const { env } = process;

const { JWT_SECRET: jwtSecret = "", DB_STRING: dbString = "", PORT: port, SMTP_HOST : smtpHost, SMTP_PORT: smtpPort, SMTP_USER: smtpUser, SMTP_PASS: smtpPass } = env;

export const envs = {
  jwtSecret, 
  dbString,
  port,
  smtpHost,
  smtpPort,
  smtpUser,
  smtpPass
};
