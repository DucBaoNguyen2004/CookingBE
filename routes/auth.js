import express from "express";
const router = express.Router();
import * as authController from "../controllers/authController.js";
import authMiddleware from "../middleware/auth.js";

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.getCurrentUser);
router.post("/request-password-reset", authController.requestPasswordReset);

export default router;