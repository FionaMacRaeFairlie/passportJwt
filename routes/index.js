// routes/user.js
import { Router } from "express";

const router = Router();

/* GET users listing */
router.get("/", async (req, res) => {
  res.render("index");
});

export default router;
