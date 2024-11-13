import { UserRolesEnum } from "@prisma/client";
import crypto from "crypto";
import { HttpStatus } from "http-status-ts";
import Joi from "joi";
import jwt from "jsonwebtoken";
import prisma from "@config/database";
import { envs } from "@config/vars";
import APIError from "@utils/api-error";
import  ERRORS  from "@utils/errors";
import { emailService } from "./email";
import { parseJwt } from "@utils/jwt";


export type UserLoginPayload = {
  id: string;
  email: string;
  name: string;
  role: UserRolesEnum;
};





const schema = Joi.object({
  id: Joi.string().optional(),
  email: Joi.string().required(),
  name: Joi.string().required(),
  phoneNumber: Joi.string().allow(null, ""),
  password: Joi.string().required(),
});

const changePasswordSchema = Joi.object({
  email: Joi.string().required(),
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().required(),
});

const updateShema = Joi.object({
  id: Joi.string().optional(),
  email: Joi.string(),
  name: Joi.string(),
  phoneNumber: Joi.string().allow(null, ""),
  password: Joi.string().optional(),
  role: Joi.string().optional(),
});

const create = async (user:typeof schema) => {
  const { error, value } = schema.validate(user);
  if (error)
    throw new APIError({
      message: `Bad payload ${error.message}`,
      status: HttpStatus.BAD_REQUEST,
    });
  value.password = crypto
    .createHash("sha1")
    .update(value.password, "binary")
    .digest("hex");
  const newUser = await prisma.user.create({ data: value });
  return newUser;
};

const signUp = async (user: typeof schema) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const { error, value } = schema.validate(user);
  if (error) {
    throw new APIError({
      message: `Bad payload ${error.message}`,
      status: HttpStatus.BAD_REQUEST,
    });
  }

  const userExist = await prisma.user.findFirst({
    where: { email: value.email.toLowerCase() },
  });

  if (userExist) {
    throw new APIError({
      message: ERRORS.users.email_already_exist,
      status: HttpStatus.CONFLICT,
    });
  }

  value.email = value.email.toLowerCase();
  value.password = crypto.createHash("sha1").update(value.password, "binary").digest("hex");

  // Generate 6-digit verification code
  const verificationCode = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  const verificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // Expires in 15 minutes

  value.verificationCode = verificationCode;
  value.verificationCodeExpiresAt = verificationCodeExpiresAt;
  value.verificationAttempts = 0;
  value.isVerified = false;

  const newUser = await prisma.user.create({ data: value });

  // Send verification email
  await emailService.sendVerificationEmail(newUser.email!, verificationCode,newUser.language!);

  return newUser;
};


const login = async ({ email, password }: { email: string; password: string }) => {
  await new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });
  const hashpassword = crypto
    .createHash("sha1")
    .update(password, "binary")
    .digest("hex");
  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase(), password: hashpassword },
  });

  if (!user) {
    throw new APIError({
      message: ERRORS.users.wrong_credentials,
      status: HttpStatus.UNAUTHORIZED,
    });
  }

  if (!user.isVerified) {
    throw new APIError({
      message: "Please verify your email before logging in.",
      status: HttpStatus.UNAUTHORIZED,
    });
  }
  const { password: _, ...userWithoutPassword } = user;
  const token = jwt.sign({user: userWithoutPassword }, envs.jwtSecret, { expiresIn: "1h" });
  const refreshToken = jwt.sign({user: userWithoutPassword }, envs.jwtSecret, { expiresIn: "7d" });


  return { user: userWithoutPassword, token,refreshToken };
};

const get = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user)
    throw new APIError({
      message: "No such user",
      status: HttpStatus.NOT_FOUND,
    });
  return user;
};

const getAll = async () => {
  const users = await prisma.user.findMany();
  return users;
};

const update = async (id:string, payload:UserLoginPayload) => {
  const { error, value } = updateShema.validate(payload);
  if (error)
    throw new APIError({
      message: `Bad payload ${error.message}`,
      status: HttpStatus.BAD_REQUEST,
    });
  const updatedValue = await prisma.user.update({
    where: { id },
    data: value,
  });
  if (!updatedValue)
    throw new APIError({ message: "Not Found", status: HttpStatus.NOT_FOUND });
  return updatedValue;
};

const remove = async (id:string) => {
  const user = await get(id);
  if (!user)
    throw new APIError({
      message: "No such user",
      status: HttpStatus.NOT_FOUND,
    });
  await prisma.user.delete({ where: { id } });
};

const resetPassword = async (payload:typeof changePasswordSchema) => {
  const { error,value } = changePasswordSchema.validate(payload);
  if (error)
    throw new APIError({
      message: `Bad payload ${error.message}`,
      status: HttpStatus.BAD_REQUEST,
    });
  const user = await prisma.user.findFirst({
    where: {
      email: value.email,
      password: crypto
        .createHash("sha1")
        .update(value.oldPassword, "binary")
        .digest("hex"),
    },
  });

  if (!user)
    throw new APIError({
      message: `No user found with following email ${value.email}`,
      status: HttpStatus.NOT_FOUND,
    });

  await prisma.user.update({
    where: { email: value.email },
    data: {
      password: crypto
        .createHash("sha1")
        .update(value.newPassword, "binary")
        .digest("hex"),
    },
  });
};


const refresh = async (refreshToken: string, userId: string) => {
  // Verify the provided refresh token
  try {
    const decoded = jwt.verify(refreshToken, envs.jwtSecret);
    const decodedUser = parseJwt(refreshToken);
    if (decodedUser.user.id !== userId) {
      throw new APIError({
        message: "Invalid refresh token",
        status: HttpStatus.UNAUTHORIZED,
      });
    }
  } catch (error) {
    throw new APIError({
      message: "Invalid refresh token",
      status: HttpStatus.UNAUTHORIZED,
    });
  }

  // Fetch the user from the database
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new APIError({
      message: "No such user",
      status: HttpStatus.NOT_FOUND,
    });
  }

  // Exclude the password from the user object
  const { password: _, ...userWithoutPassword } = user;

  // Generate new tokens
  const token = jwt.sign({ user: userWithoutPassword }, envs.jwtSecret, { expiresIn: "1h" });
  const newRefreshToken = jwt.sign({ user: userWithoutPassword }, envs.jwtSecret, { expiresIn: "7d" });

  return { token, refreshToken: newRefreshToken };
};


const verifyEmail = async (email: string, code: string) => {
  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase() },
  });
  if (!user) {
    throw new APIError({
      message: "User not found",
      status: HttpStatus.NOT_FOUND,
    });
  }

  if (user.isVerified) {
    throw new APIError({
      message: "Email is already verified",
      status: HttpStatus.BAD_REQUEST,
    });
  }

  // Check if code has expired
  if (user.verificationCodeExpiresAt && user.verificationCodeExpiresAt < new Date()) {
    throw new APIError({
      message: "Verification code has expired",
      status: HttpStatus.BAD_REQUEST,
    });
  }

  // Check if code matches
  if (user.verificationCode !== code) {
    // Increment verificationAttempts
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationAttempts: user.verificationAttempts + 1,
      },
    });

    if (user.verificationAttempts + 1 >= 5) {
      // Reset code and require resend
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationCode: null,
          verificationCodeExpiresAt: null,
          verificationAttempts: 0,
        },
      });
      throw new APIError({
        message: "Maximum verification attempts exceeded. Please request a new code.",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    throw new APIError({
      message: "Invalid verification code",
      status: HttpStatus.BAD_REQUEST,
    });
  }

  // Verification successful
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationCode: null,
      verificationCodeExpiresAt: null,
      verificationAttempts: 0,
    },
  });
};

const resendVerificationEmail = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    throw new APIError({
      message: "No user found with that email address",
      status: HttpStatus.NOT_FOUND,
    });
  }
  if (user.isVerified) {
    throw new APIError({
      message: "Email is already verified",
      status: HttpStatus.BAD_REQUEST,
    });
  }
  const verificationCode = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  const verificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // Expires in 15 minutes
  await prisma.user.update({
    where: { id: user.id },
    data: {
      verificationCode,
      verificationCodeExpiresAt,
      verificationAttempts: 0,
    },
  });
  await emailService.sendVerificationEmail(user.email!, verificationCode,user.language!);
};


export const userService = {
  create,
  get,
  getAll,
  login,
  update,
  remove,
  resetPassword,
  signUp,
  refresh,
  verifyEmail,
  resendVerificationEmail
};
