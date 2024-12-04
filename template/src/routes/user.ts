import {
	create,
	get,
	getAll,
	login,
	refresh,
	remove,
	resendVerificationEmail,
	resetPassword,
	signUp,
	update,
	verifyEmail,
} from "@controllers/user";
import JWTCheck from "@middlewares/auth";
import { UserRolesEnum } from "@prisma/client";
import express from "express";

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
router.post("/verify-email", verifyEmail);
router.post("/resend-verification-email", resendVerificationEmail);
router.post("/refresh", refresh);
export default router;
