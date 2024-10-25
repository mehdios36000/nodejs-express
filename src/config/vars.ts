import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const { env } = process;

const { JWT_SECRET: jwtSecret = "", DB_STRING: dbString = "" } = env;

export const envs = {
  jwtSecret, 
  dbString,
};
