import { UserRolesEnum } from "@prisma/client";
import express from "express";
import JWTCheck from "@middlewares/auth";
import {
  create,
  get,
  getAll,
  login,
  remove,
  resetPassword,
  signUp,
  update,
} from "@controllers/user";

const router = express.Router();

// USERS
router.post("/", JWTCheck([UserRolesEnum.ADMIN]), create);
router.post("/login", login);
router.post("/sign-up", signUp);
router.post("/change-password", resetPassword);
router.get("/:id", JWTCheck([UserRolesEnum.ADMIN]), get);
router.get("/", JWTCheck([UserRolesEnum.ADMIN]), getAll);
router.patch("/:id", JWTCheck([UserRolesEnum.ADMIN]), update);
router.delete("/:id", JWTCheck([UserRolesEnum.ADMIN]), remove);

export default router;
