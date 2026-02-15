import { Router, type Response } from "express";
import { authMiddleware, type AuthRequest } from "../middleware/auth.js";
import { getTripsForUser, getTripForUser, insertTrip, updateTrip, deleteTrip } from "../db/tripsDb.js";

const router = Router();

router.get("/api/trips", authMiddleware, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "unauthorized" });
  const trips = getTripsForUser(req.user.userId);
  res.json(trips);
});

router.post("/api/trips", authMiddleware, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "unauthorized" });
  const body = req.body as Record<string, unknown>;
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) {
    return res.status(400).json({ error: "trip id required" });
  }
  try {
    insertTrip(req.user.userId, body);
  } catch (err: unknown) {
    const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "";
    if (msg.includes("UNIQUE") || msg.includes("FOREIGN KEY")) {
      return res.status(409).json({ error: "trip already exists" });
    }
    throw err;
  }
  const trip = getTripForUser(req.user.userId, id);
  if (!trip) return res.status(500).json({ error: "failed to read back trip" });
  res.status(201).json(trip);
});

const paramId = (params: Record<string, string | string[] | undefined>, key: string): string =>
  Array.isArray(params[key]) ? (params[key] as string[])[0] ?? "" : (params[key] as string) ?? "";

router.get("/api/trips/:id", authMiddleware, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "unauthorized" });
  const id = paramId(req.params, "id");
  const trip = getTripForUser(req.user.userId, id);
  if (!trip) return res.status(404).json({ error: "trip not found" });
  res.json(trip);
});

router.patch("/api/trips/:id", authMiddleware, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "unauthorized" });
  const id = paramId(req.params, "id");
  const existing = getTripForUser(req.user.userId, id);
  if (!existing) return res.status(404).json({ error: "trip not found" });
  const body = req.body as Record<string, unknown>;
  updateTrip(req.user.userId, id, body);
  const trip = getTripForUser(req.user.userId, id);
  if (!trip) return res.status(500).json({ error: "failed to read back trip" });
  res.json(trip);
});

router.delete("/api/trips/:id", authMiddleware, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "unauthorized" });
  const id = paramId(req.params, "id");
  const changes = deleteTrip(req.user.userId, id);
  if (changes === 0) return res.status(404).json({ error: "trip not found" });
  res.status(204).send();
});

export default router;
