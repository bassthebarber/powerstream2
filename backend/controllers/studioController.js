// backend/controllers/studioController.js
export const getStudioSummary = async (req, res) => {
  res.json({ ok: true, summary: { sessions: 0, recordings: 0, beats: 0 } });
};
export const getSession = async (req, res) => {
  res.json({ ok: true, session: { _id: req.params.id } });
};
export const createSession = async (req, res) => {
  res.status(201).json({ ok: true, session: req.body });
};
export const updateSession = async (req, res) => {
  res.json({ ok: true, session: { _id: req.params.id, ...req.body } });
};
export const deleteSession = async (req, res) => {
  res.json({ ok: true, message: "Deleted" });
};
export default { getStudioSummary, getSession, createSession, updateSession, deleteSession };










