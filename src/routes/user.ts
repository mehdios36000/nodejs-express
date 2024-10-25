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
router.post("/", JWTCheck([UserRolesEnum.SHOP_OWNER]), create);
router.post("/login", login);
router.post("/sign-up", signUp);
router.post("/change-password", resetPassword);
router.get("/:id", JWTCheck([UserRolesEnum.SHOP_OWNER]), get);
router.get("/", JWTCheck([UserRolesEnum.SHOP_OWNER]), getAll);
router.patch("/:id", JWTCheck([UserRolesEnum.SHOP_OWNER]), update);
router.delete("/:id", JWTCheck([UserRolesEnum.SHOP_OWNER]), remove);

export default router;
