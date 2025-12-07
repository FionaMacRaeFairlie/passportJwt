// routes/auth.js (ESM)
import { Router } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import dao from "../models/userModel.js"; // the default instance

const router = Router();

/* POST /login */
router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: info ? info.message : "Login failed",
        user,
      });
    }

    // passport attaches req.login; still callback-based
    req.login(user, { session: false }, (loginErr) => {
      if (loginErr) {
        return res.status(500).send(loginErr);
      }

      // Your original code signed `user[0]`; keep compatibility if needed:
      const payload = Array.isArray(user) ? user[0] : user;

      const token = jwt.sign(
        payload, // typically you'd sign a minimal payload: { sub: user._id, email: user.email }
        process.env.JWT_SECRET || "your_jwt_secret",
        { expiresIn: "1h" } // adjust as needed
      );

      // Set JWT in cookie (HttpOnly). Set secure: true when served over HTTPS.
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      return res.json({ info, token });
    });
  })(req, res, next);
});

// router.post('/login', async (req, res, next) => {
//   try {
//     const { user, password } = req.body;

//     const found = await dao.findOne({ user });
//     if (!found) return res.status(401).json({ error: 'Invalid credentials' });

//     // ⚠️ DEMO ONLY: replace with bcrypt.compare in production
//     if (found.password !== password) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     const token = jwt.sign(
//       { sub: found._id, user: found.user, role: found.role },
//       process.env.JWT_SECRET || 'dev-secret',
//       { expiresIn: '1h' }
//     );

//     res.cookie('jwt', token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       maxAge: 60 * 60 * 1000,
//     });

//     res.json({ token });
//   } catch (err) {
//     next(err);
//   }
// });

/* GET /logout */
router.get("/logout", (req, res) => {
  res.clearCookie("jwt").status(200).redirect("/");
});

export default router;
