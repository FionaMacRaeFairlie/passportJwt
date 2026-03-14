import { Router } from "express";
import { authenticateJWT } from "../middleware/authenticate-jwt.js";
import { requireAdmin } from "../middleware/require-role.js";
import { attachUserToLocals } from "../middleware/locals.js";

const router = Router();

// Admin page (view)
router.get(
  "/admin",
  authenticateJWT(),
  requireAdmin,
  attachUserToLocals,
  (req, res) => {
    res.render("admin-dashboard", {
      user: req.user.user,
      admin: req.user.role,
      message: "You have logged in successfully",
      nav: { home: false, site: false, adminPage: true },
    });
  }
);

export default router;
