import { Router, type Response } from "express";
import { authMiddleware, type AuthRequest } from "../middleware/auth.js";
import { createSharedTripFromTrip, getSharedTripById, updateSharedTrip } from "../db/tripsDb.js";

const router = Router();

const paramId = (params: Record<string, string | string[] | undefined>, key: string): string =>
  Array.isArray(params[key]) ? ((params[key] as string[])[0] ?? "") : ((params[key] as string) ?? "");

router.post("/api/trips/:tripId/share", authMiddleware, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "unauthorized" });
  const tripId = paramId(req.params, "tripId");
  if (!tripId) return res.status(400).json({ error: "trip id required" });

  try {
    const shareId = createSharedTripFromTrip(req.user.userId, tripId);
    if (!shareId) return res.status(404).json({ error: "trip not found" });
    res.status(201).json({ id: shareId });
  } catch (err: unknown) {
    const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "";
    if (msg.includes("UNIQUE") || msg.includes("FOREIGN KEY")) {
      return res.status(409).json({ error: "failed to create share" });
    }
    throw err;
  }
});

router.get("/api/share/:id", (req, res: Response) => {
  const id = paramId(req.params, "id");
  const trip = getSharedTripById(id);
  if (!trip) return res.status(404).json({ error: "shared trip not found" });
  res.json(trip);
});

router.patch("/api/share/:id", (req, res: Response) => {
  const id = paramId(req.params, "id");
  const existing = getSharedTripById(id);
  if (!existing) return res.status(404).json({ error: "shared trip not found" });
  const body = req.body as Record<string, unknown>;
  updateSharedTrip(id, body);
  const trip = getSharedTripById(id);
  if (!trip) return res.status(500).json({ error: "failed to read back shared trip" });
  res.json(trip);
});

export default router;
