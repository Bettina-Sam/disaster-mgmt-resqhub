const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const router = express.Router();

// helper: sign token
function sign(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );
}

/**
 * POST /api/auth/register
 * First-ever user becomes ADMIN automatically. Others default USER.
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already in use" });

    const hash = await bcrypt.hash(password, 10);

    let userRole = "USER";
    const anyUser = await User.countDocuments();
    if (anyUser === 0) userRole = "ADMIN";             // first user = ADMIN
    else if (role === "RESPONDER") userRole = "RESPONDER"; // allow responders from UI

    const user = await User.create({ name, email, password: hash, role: userRole });
    const token = sign(user);
    res.status(201).json({ token, user: { id: user._id, name, email, role: user.role } });
  } catch (e) {
    res.status(400).json({ message: "Register failed", error: e.message });
  }
});

/**
 * POST /api/auth/login
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = sign(user);
  res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
});

/**
 * GET /api/auth/me  (verify token)
 */
router.get("/me", (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: payload });
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
});

module.exports = router;
