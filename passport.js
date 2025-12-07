// const passport = require("passport");
// const passportJWT = require("passport-jwt");
// const bcrypt = require("bcrypt");

// const UserModel = require("./models/userModel");
// // const { verify } = require("jsonwebtoken");

// // const ExtractJWT = passportJWT.ExtractJwt;

// const LocalStrategy = require("passport-local").Strategy;
// const JWTStrategy = passportJWT.Strategy;

// passport.use(
//   new LocalStrategy(
//     {
//       usernameField: "user",
//       passwordField: "password",
//     },
//     function (user, password, cb) {
//       //Assume there is a DB module providing a global UserModel
//       return UserModel.findOne({ user })
//         .then((user) => {
//           if (!user) {
//             return cb(null, false, { message: "Incorrect email or password." });
//           }
//           bcrypt.compare(password, user[0].password, function (err, result) {
//             console.log("result",result)
//             if (result) {
//               return cb(null, user, {
//                 message: "Logged In Successfully",
//               });
//             } else {
//               console.log("password issue");
//               return cb(null, false, { message: "Problem with password." });
//             }
//           });
//         })
//         .catch((err) => {
//           return cb(err);
//         });
//     }
//   )
// );

// var cookieExtractor = function (req) {
//   var token = null;
//   if (req && req.cookies) {
//     token = req.cookies["jwt"];
//   }
//   return token;
// };

// passport.use(
//   new JWTStrategy(
//     {
//       secretOrKey: "your_jwt_secret",
//       jwtFromRequest: cookieExtractor,
//     },
//     async (token, done) => {
//       try {
//         return done(null, token.user);
//       } catch (error) {
//         done(error);
//       }
//     }
//   )
// );

// passport.js

// import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

// const configurePassport = (passport, db) => {
//   const opts = {
//     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//     secretOrKey: process.env.JWT_SECRET || "dev-secret",
//   };

//   passport.use(
//     new JwtStrategy(opts, async (payload, done) => {
//       try {
//         const user = await db.users.findOne({ _id: payload.sub });
//         if (user) return done(null, user);
//         return done(null, false);
//       } catch (err) {
//         return done(err, false);
//       }
//     })
//   );
// };
// export default configurePassport;

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
