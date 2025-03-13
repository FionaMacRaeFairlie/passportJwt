const passport = require("passport");
const passportJWT = require("passport-jwt");
const bcrypt = require("bcrypt");

const UserModel = require("./models/userModel");
// const { verify } = require("jsonwebtoken");

// const ExtractJWT = passportJWT.ExtractJwt;

const LocalStrategy = require("passport-local").Strategy;
const JWTStrategy = passportJWT.Strategy;

passport.use(
  new LocalStrategy(
    {
      usernameField: "user",
      passwordField: "password",
    },
    function (user, password, cb) {
      //Assume there is a DB module providing a global UserModel
      return UserModel.findOne({ user })
        .then((user) => {
          if (!user) {
            return cb(null, false, { message: "Incorrect email or password." });
          }
          bcrypt.compare(password, user[0].password, function (err, result) {
            console.log("result",result)
            if (result) {
              return cb(null, user, {
                message: "Logged In Successfully",
              });
            } else {
              console.log("password issue");
              return cb(null, false, { message: "Problem with password." });
            }
          });
        })
        .catch((err) => {
          return cb(err);
        });
    }
  )
);

var cookieExtractor = function (req) {
  var token = null;
  if (req && req.cookies) {
    token = req.cookies["jwt"];
  }
  return token;
};

passport.use(
  new JWTStrategy(
    {
      secretOrKey: "your_jwt_secret",
      jwtFromRequest: cookieExtractor,
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
);