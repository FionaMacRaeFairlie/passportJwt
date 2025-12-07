// routes/user.js
import { Router } from "express";

const router = Router();

/* GET users listing */
router.get("/", async (req, res) => {
  res.send("respond with a resource");
});

/* GET user profile */
router.get("/profile", async (req, res) => {
  res.send(req.user);
});

export default router;
