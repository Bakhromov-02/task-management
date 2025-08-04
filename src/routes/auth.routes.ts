import express from "express";

import { UserRole } from "../types";
import { createAdmin, getAllUsers, getProfile, login, register } from "../controllers/auth.controller";
import { authenticate, authorize, validateLogin, validateRegister } from "../middleware";

const router = express.Router();

router.post(
  "/register/admin",
  validateRegister,
  authenticate,
  authorize(UserRole.admin),
  createAdmin
);
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/profile", authenticate, getProfile);
router.get("/users", authenticate, authorize(UserRole.admin), getAllUsers);

export default router;
