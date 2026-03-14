// passport.js
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy /*, ExtractJwt*/ } from "passport-jwt";
import bcrypt from "bcrypt";

// IMPORTANT: ensure your user model/DAO is ESM and returns a *single* user document.
// If you're using nedb-promises, expose `findOne` that returns one doc.
// Example import (adjust path and export to match your project):
import UserModel from "./models/userModel.js";

/**
 * Extract JWT from cookies (e.g., `jwt` cookie).
 * Requires `cookie-parser` middleware in your app.
 */
const cookieExtractor = (req) => (req?.cookies ? req.cookies.jwt : null);

/**
 * Configure Passport strategies.
 * Call `configurePassport(passport)` in your app before `passport.initialize()`.
 */
export const configurePassport = (passportInstance = passport) => {
  // ---- Local Strategy (username: 'user', password: 'password') ----
  passportInstance.use(
    new LocalStrategy(
      { usernameField: "user", passwordField: "password" },
      async (user, password, done) => {
        try {
          // `user` here is the username field (e.g., 'alice')
          const record = await UserModel.findOne({ user });

          if (!record) {
            return done(null, false, {
              message: "Incorrect email or password.",
            });
          }

          const ok = await bcrypt.compare(password, record.password);
          if (!ok) {
            return done(null, false, { message: "Problem with password." });
          }

          // Success: pass the user document through
          return done(null, record, { message: "Logged In Successfully" });
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // ---- JWT Strategy (reads token from cookie) ----
  passportInstance.use(
    new JwtStrategy(
      {
        secretOrKey: process.env.JWT_SECRET || "your_jwt_secret",
        jwtFromRequest: cookieExtractor,
      },
      async (payload, done) => {
        try {
          // Support both styles:
          // 1) Token contains the entire user document (legacy)
          // 2) Token contains minimal claims like { sub: userId, email, role }
          const userId = payload?.sub || payload?._id;

          if (userId) {
            const user = await UserModel.findOne({ _id: userId });
            if (!user) return done(null, false);
            return done(null, user);
          }

          // Fallback: if the payload is the whole user doc, pass it through
          return done(null, payload);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
};
