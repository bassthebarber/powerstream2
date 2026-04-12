// backend/controllers/userController.js
import User from "../models/User.js";

export const getMe = async (req, res) => {
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

export const updateMe = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.userId, req.body, { new: true });
    res.json({ ok: true, user });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }
    res.json({ ok: true, user });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").limit(50);
    res.json({ ok: true, users });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

export default { getMe, updateMe, getUserById, getAllUsers };










