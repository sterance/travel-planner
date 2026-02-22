import { Router, type Request, type Response } from "express";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { db } from "../db.js";
import { authMiddleware, signToken, type AuthRequest } from "../middleware/auth.js";

const router = Router();
const SALT_ROUNDS = 10;

router.post("/api/auth/register", async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || typeof email !== "string" || !password || typeof password !== "string") {
    res.status(400).json({ error: "email and password required" });
    return;
  }
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail || password.length < 8) {
    res.status(400).json({ error: "invalid email or password (min 8 characters)" });
    return;
  }
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const id = randomUUID();
  try {
    db.prepare("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)").run(id, trimmedEmail, password_hash);
  } catch (err: unknown) {
    const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "";
    if (msg.includes("UNIQUE")) {
      res.status(409).json({ error: "email already registered" });
      return;
    }
    throw err;
  }
  const token = signToken({ userId: id, email: trimmedEmail });
  res.status(201).json({ token, user: { id, email: trimmedEmail } });
});

router.post("/api/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || typeof email !== "string" || !password || typeof password !== "string") {
    res.status(400).json({ error: "email and password required" });
    return;
  }
  const trimmedEmail = email.trim().toLowerCase();
  const row = db.prepare("SELECT id, password_hash FROM users WHERE email = ?").get(trimmedEmail) as
    | { id: string; password_hash: string }
    | undefined;
  if (!row) {
    res.status(401).json({ error: "invalid email or password" });
    return;
  }
  const match = await bcrypt.compare(password, row.password_hash);
  if (!match) {
    res.status(401).json({ error: "invalid email or password" });
    return;
  }
  const token = signToken({ userId: row.id, email: trimmedEmail });
  res.json({ token, user: { id: row.id, email: trimmedEmail } });
});

router.get("/api/auth/me", authMiddleware, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  res.json({ user: { id: req.user.userId, email: req.user.email } });
});

export default router;
