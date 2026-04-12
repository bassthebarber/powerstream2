// backend/controllers/authController.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "powerstream-dev-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ ok: false, error: "Email already registered" });
    }

    const user = await User.create({ email, password, name });
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(201).json({
      ok: true,
      token,
      user: { _id: user._id, email: user.email, name: user.name },
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ ok: false, error: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ ok: false, error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      ok: true,
      token,
      user: { _id: user._id, email: user.email, name: user.name, isAdmin: user.isAdmin },
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

export const logout = async (req, res) => {
  res.json({ ok: true, message: "Logged out" });
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }
    res.json({ ok: true, user });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

export default { register, login, logout, me };










