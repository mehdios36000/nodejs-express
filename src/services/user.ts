import { UserRolesEnum } from "@prisma/client";
import crypto from "crypto";
import { HttpStatus } from "http-status-ts";
import Joi from "joi";
import jwt from "jsonwebtoken";
import prisma from "@config/database";
import { envs } from "@config/vars";
import APIError from "@utils/api-error";
import  ERRORS  from "@utils/errors";


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

const signUp = async (user:typeof changePasswordSchema) => {
  await new Promise((resolve) => {
    setTimeout(resolve, 500);
  });
  const { error, value } = schema.validate(user);
  if (error)
    throw new APIError({
      message: `Bad payload ${error.message}`,
      status: HttpStatus.BAD_REQUEST,
    });
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
  value.password = crypto
    .createHash("sha1")
    .update(value.password, "binary")
    .digest("hex");
  const newUser = await prisma.user.create({ data: value });
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
  const token = jwt.sign({ user }, envs.jwtSecret, { expiresIn: "3d" });
  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
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

export const userService = {
  create,
  get,
  getAll,
  login,
  update,
  remove,
  resetPassword,
  signUp,
};
