// middleware/authenticate-jwt.js
import jwt from "jsonwebtoken";

/**
 * Verifies a JWT from:
 *   1) HttpOnly cookie (`jwt` by default), or
 *   2) Authorization header: Bearer <token>
 *
 * Attaches a normalized user object on req.user: { id, role, email, user }
 */
export function authenticateJWT({ cookieName = "jwt" } = {}) {
  return (req, res, next) => {
    const fromCookie = req.cookies?.[cookieName];
    const authHeader = req.get("Authorization") || "";
    const fromHeader = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    const token = fromCookie || fromHeader;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: missing token" });
    }

    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret"
      );

      // Normalize the shape so the rest of the app can rely on req.user.id / role
      const id = payload.sub ?? payload.id ?? payload._id ?? payload.userId;
      req.user = {
        id,
        role: payload.role,
        email: payload.email,
        user: payload.user,
        // keep the raw payload if you need more later:
        _raw: payload,
      };

      return next();
    } catch (err) {
      return res
        .status(401)
        .json({ error: "Unauthorized: invalid or expired token" });
    }
  };
}
