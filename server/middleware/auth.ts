import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

const secretRaw = process.env.JWT_SECRET;
if (!secretRaw) {
  throw new Error("JWT_SECRET must be set");
}
const secret: string = secretRaw;

export interface AuthPayload {
  userId: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "missing or invalid authorization header" });
    return;
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, secret) as unknown as AuthPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "invalid or expired token" });
  }
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}
