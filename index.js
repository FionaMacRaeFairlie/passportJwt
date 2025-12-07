// app.js
import express from "express";
import path from "path";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mustache from "mustache-express";

import passport from "passport";
import { configurePassport } from "./passport.js";

import { fileURLToPath } from "url";

import { createDB } from "./db/index.js";

// Routes (ESM modules)
import indexRouter from "./routes/index.js";
import loginRouter from "./routes/login.js";
import userRouter from "./routes/user.js";
import authRouter from "./routes/auth.js";

// __dirname replacement in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Instantiate Express
const app = express();
const port = process.env.PORT || 3000;

// ---- DB ----
const db = await createDB(path.join(__dirname, "data"));
app.locals.db = db; // make DB available to routes via req.app.locals.db

// ---- View engine (Mustache) ----
app.engine("mustache", mustache());
app.set("view engine", "mustache");
app.set("views", path.join(__dirname, "views"));

// ---- Static assets ----
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));
app.use(
  "/css",
  express.static(
    path.join(__dirname, "node_modules", "bootstrap", "dist", "css")
  )
);

// ---- Core middleware ----
app.use(morgan("dev"));
app.use(express.json()); // parse application/json
app.use(express.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(cookieParser());

// ---- Passport ----

configurePassport(passport);
app.use(passport.initialize());

// ---- Routes ----
app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/user", passport.authenticate("jwt", { session: false }), userRouter);
app.use("/auth", authRouter);

// ---- 404 ----
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// ---- Error handler ----
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error", { message: "error page" });
});

// ---- Start server ----
app.listen(port, () => {
  console.log(`Server started on port ${port}. Ctrl^c to quit.`);
});

export default app;
