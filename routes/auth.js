// routes/auth.js
import { Router } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";

const router = Router();

/* POST /login */
router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    console.log("Authentication result:", { err, user, info }); // Debugging log
    if (err != null || !user) {
      return res.status(400).json({
        message: info ? info.message : "Login failed",
        user,
      });
    }

    // passport attaches req.login; callback-based
    req.login(user, { session: false }, (loginErr) => {
      if (loginErr) {
        return res.status(500).send(loginErr);
      }

      // Some code signed `user[0]`; keep compatibility if needed:
      const payload = Array.isArray(user) ? user[0] : user;

      const token = jwt.sign(
        payload, // typically you'd sign a minimal payload: { sub: user._id, email: user.email }
        process.env.JWT_SECRET || "your_jwt_secret",
        { expiresIn: "1h" } // can be adjusted as needed
      );

      // Set JWT in cookie (HttpOnly). Set secure: true when served over HTTPS.
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 1000, // 1 hour
      });
    });
    //  return res.json({ info });
    // return res.json({ message: "You have logged in successfully", user }); // Return user info or token in response body
    let admin = false;
    if (user.role === "admin") {
      admin = true;
    }
    return res.render("index", {
      message: "You have logged in successfully",
      user,
      admin,
    });
  })(req, res, next);
});

/* GET /logout */
router.get("/logout", (req, res) => {
  res.clearCookie("jwt").status(200).redirect("/");
});

export default router;
