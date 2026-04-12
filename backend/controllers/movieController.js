// backend/controllers/movieController.js
export const getAllMovies = async (req, res) => {
  res.json({ ok: true, movies: [] });
};
export const getMovieById = async (req, res) => {
  res.json({ ok: true, movie: { _id: req.params.id } });
};
export const createMovie = async (req, res) => {
  res.status(201).json({ ok: true, movie: req.body });
};
export const updateMovie = async (req, res) => {
  res.json({ ok: true, movie: { _id: req.params.id, ...req.body } });
};
export const deleteMovie = async (req, res) => {
  res.json({ ok: true, message: "Deleted" });
};
export default { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie };










