// routes/login.js
import { Router } from "express";

const router = Router();

/* GET login page */
router.get("/", async (req, res) => {
  res.render("login");
});
export default router;
