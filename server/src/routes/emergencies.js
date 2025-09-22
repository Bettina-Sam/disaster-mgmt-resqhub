const express = require("express");
const router = express.Router();

const Emergency = require("../models/emergency.model");
const { auth, requireRole } = require("../middleware/auth");

// ---------- GET all (public)
router.get("/", async (_req, res) => {
  try {
    const items = await Emergency.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch emergencies" });
  }
});

// ---------- CREATE (ADMIN or RESPONDER)
router.post("/", auth, requireRole("ADMIN", "RESPONDER"), async (req, res) => {
  try {
    const doc = await Emergency.create(req.body);
    req.app.get("io").emit("emergency:new", doc);
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ message: "Failed to create", error: e.message });
  }
});

// ---------- UPDATE (ADMIN or RESPONDER)
router.put("/:id", auth, requireRole("ADMIN", "RESPONDER"), async (req, res) => {
  try {
    const updated = await Emergency.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    req.app.get("io").emit("emergency:update", updated);
    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: "Failed to update", error: e.message });
  }
});

// ---------- DELETE (ADMIN only)
router.delete("/:id", auth, requireRole("ADMIN"), async (req, res) => {
  try {
    const deleted = await Emergency.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    req.app.get("io").emit("emergency:delete", { _id: req.params.id });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ message: "Failed to delete", error: e.message });
  }
});

module.exports = router;
