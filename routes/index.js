// routes/user.js
import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

/* GET users listing */
router.get("/", (req, res) => {
  if (req.cookies.jwt) {
    const token = req.cookies?.jwt;
    const payload = jwt.verify(token, "your_jwt_secret");
    req.user = payload;

    res.render("index", {
      user: req.user,
      admin: req.user.role === "admin",
      message: "You have logged in successfully",
      nav: { home: true, site: false, adminPage: false },
    });
  } else {
    res.render("index", {
      message: "Welcome to the home page",
      nav: { home: true, site: false, adminPage: false },
    });
  }
});

export default router;
