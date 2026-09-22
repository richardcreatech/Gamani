import jwt from "jsonwebtoken";

export function decodeToken(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (typeof decoded === "string" || !decoded || typeof decoded !== "object") {
    throw new Error("Invalid token payload.");
  }

  if (!decoded.id) {
    throw new Error("Invalid token payload.");
  }

  return decoded;
}

export function verifyToken(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "No token provided.",
      });
    }

    const payload = decodeToken(token);

    req.user = {
      id: payload.id,
      iat: payload.iat,
      exp: payload.exp,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
}