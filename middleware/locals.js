// middleware/locals.js
export function attachUserToLocals(req, res, next) {
  res.locals.user = req.user || null;
  res.locals.isAdmin = Boolean(req.user?.role === "admin");
  next();
}
