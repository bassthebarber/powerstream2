// Stub controller
export const getAll = async (req, res) => res.json({ ok: true, data: [] });
export const getById = async (req, res) => res.json({ ok: true, data: { _id: req.params.id } });
export const create = async (req, res) => res.status(201).json({ ok: true, data: req.body });
export const update = async (req, res) => res.json({ ok: true, data: req.body });
export const remove = async (req, res) => res.json({ ok: true, message: 'Deleted' });
export default { getAll, getById, create, update, remove };
