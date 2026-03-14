// routes/user.js
import { Router } from "express";
import { authenticateJWT } from "../middleware/authenticate-jwt.js";
import { attachUserToLocals } from "../middleware/locals.js";

const router = Router();

router.get("/content", authenticateJWT(), attachUserToLocals, (req, res) => {
  let admin = req.user.role ? req.user.role === "admin" : false;
  res.render("logged-in-page", {
    user: req.user.user,
    role: req.user.role,
    admin: admin,
    message: "You have logged in successfully",
    nav: { home: false, site: true, adminPage: false },
  });
});

export default router;
