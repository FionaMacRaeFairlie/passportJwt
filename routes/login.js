// routes/login.js
import { Router } from "express";

const router = Router();

/* GET login page */
router.get("/", async (req, res) => {
  res.render("login");
});
/* GET /logout */
router.get("/logout", (req, res) => {
  res.clearCookie("jwt", { path: "/" }).status(200).redirect("/");
});

export default router;
