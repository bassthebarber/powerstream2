// backend/routes/powerstreamRoutes.js
// PowerStream Films API
import express from "express";
import Film from "../models/Film.js";
import Entitlement from "../models/Entitlement.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

const publishedFilter = () => ({
  $or: [{ isPublished: true }, { isPublished: { $exists: false } }],
});

function mapFilmCard(film) {
  const u = film.uploadedBy;
  return {
    _id: film._id,
    title: film.title,
    description: film.description,
    posterUrl: film.posterUrl || film.poster || film.thumbnailUrl,
    thumbnailUrl: film.thumbnailUrl || film.posterUrl || film.poster,
    videoUrl: film.videoUrl || film.filmUrl || film.url,
    category: film.category,
    genre: film.genre,
    views: film.views || 0,
    creatorName: film.creatorName || u?.name || film.director || "PowerStream",
    stationSlug: film.stationSlug || "",
    priceCents: film.priceCents || 0,
    requiresSubscription: !!film.requiresSubscription,
    featured: !!film.featured,
    createdAt: film.createdAt,
  };
}

// ============================================
// GET /api/powerstream/films
// Returns all films from the films collection
// ============================================
router.get("/films", async (req, res) => {
  try {
    const { page = 1, limit = 50, category, sort = "-createdAt" } = req.query;

    // Build filter
    const filter = publishedFilter();
    if (category && category !== "all") {
      filter.category = category;
    }

    // Query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const films = await Film.find(filter)
      .select("title description videoUrl posterUrl duration createdAt category genre tags views")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Map to standard response format
    const mappedFilms = films.map(film => ({
      _id: film._id,
      title: film.title,
      description: film.description,
      url: film.videoUrl,
      thumbnail: film.posterUrl,
      duration: film.duration || 0,
      createdAt: film.createdAt,
      category: film.category,
      genre: film.genre,
      tags: film.tags,
      views: film.views,
    }));

    // Get total count for pagination
    const total = await Film.countDocuments(filter);

    return res.json({
      ok: true,
      films: mappedFilms,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("[PowerStream] Films error:", err.message);
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
});

// ============================================
// GET /api/powerstream/films/:id
// Returns a single film by ID
// ============================================
router.get("/films/:id", async (req, res) => {
  try {
    const film = await Film.findById(req.params.id).lean();

    if (!film) {
      return res.status(404).json({
        ok: false,
        error: "Film not found",
      });
    }

    const payload = {
      _id: film._id,
      title: film.title,
      description: film.description,
      url: film.videoUrl || film.filmUrl,
      filmUrl: film.videoUrl || film.filmUrl,
      videoUrl: film.videoUrl || film.filmUrl,
      posterUrl: film.posterUrl || film.poster || film.thumbnailUrl,
      thumbnailUrl: film.thumbnailUrl || film.posterUrl,
      duration: film.duration || 0,
      createdAt: film.createdAt,
      category: film.category,
      genre: film.genre,
      tags: film.tags,
      views: film.views,
      trailerUrl: film.trailerUrl,
      monetization: film.monetization,
      priceCents: film.priceCents || 0,
      requiresSubscription: !!film.requiresSubscription,
      creatorName: film.creatorName || "",
      stationSlug: film.stationSlug || "",
      uploadedBy: film.uploadedBy,
    };
    return res.json({ ok: true, film: payload });
  } catch (err) {
    console.error("[PowerStream] Film error:", err.message);
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
});

router.get("/film/:id", async (req, res) => {
  try {
    const film = await Film.findById(req.params.id).lean();
    if (!film) return res.status(404).json({ ok: false, error: "Film not found" });
    return res.json({
      ok: true,
      film: {
        _id: film._id,
        title: film.title,
        description: film.description,
        url: film.videoUrl || film.filmUrl,
        filmUrl: film.videoUrl || film.filmUrl,
        videoUrl: film.videoUrl || film.filmUrl,
        posterUrl: film.posterUrl || film.poster,
        priceCents: film.priceCents || 0,
        requiresSubscription: !!film.requiresSubscription,
        creatorName: film.creatorName,
        stationSlug: film.stationSlug,
        views: film.views,
        category: film.category,
        genre: film.genre,
      },
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// ============================================
// GET /api/powerstream/films/trending
// Returns trending films (sorted by views)
// ============================================
router.get("/trending", async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const films = await Film.find(publishedFilter())
      .select("title description videoUrl posterUrl duration createdAt views")
      .sort({ views: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    const mappedFilms = films.map(film => ({
      _id: film._id,
      title: film.title,
      description: film.description,
      url: film.videoUrl,
      thumbnail: film.posterUrl,
      duration: film.duration || 0,
      createdAt: film.createdAt,
      views: film.views,
    }));

    return res.json({
      ok: true,
      films: mappedFilms,
    });
  } catch (err) {
    console.error("[PowerStream] Trending error:", err.message);
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
});

// ============================================
// GET /api/powerstream/categories
// Returns distinct categories
// ============================================
router.get("/categories", async (req, res) => {
  try {
    const categories = await Film.distinct("category", publishedFilter());

    return res.json({
      ok: true,
      categories: categories.filter(Boolean),
    });
  } catch (err) {
    console.error("[PowerStream] Categories error:", err.message);
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
});

// ============================================
// POST /api/powerstream/films/:id/view
// Increment view count
// ============================================
async function incrementFilmView(id, res) {
  try {
    const film = await Film.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
    if (!film) {
      return res.status(404).json({ ok: false, error: "Film not found" });
    }
    return res.json({ ok: true, views: film.views });
  } catch (err) {
    console.error("[PowerStream] View error:", err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

router.post("/film/:id/view", (req, res) => incrementFilmView(req.params.id, res));

router.post("/films/:id/view", (req, res) => incrementFilmView(req.params.id, res));

// Netflix-style catalog: Featured, Trending, New Releases, By Station
router.get("/catalog", async (req, res) => {
  try {
    const pf = publishedFilter();
    const [featured, trending, newReleases, withStation] = await Promise.all([
      Film.find({ ...pf, featured: true })
        .populate("uploadedBy", "name")
        .sort({ createdAt: -1 })
        .limit(14)
        .lean(),
      Film.find(pf).populate("uploadedBy", "name").sort({ views: -1 }).limit(20).lean(),
      Film.find(pf).populate("uploadedBy", "name").sort({ createdAt: -1 }).limit(20).lean(),
      Film.find({ ...pf, stationSlug: { $exists: true, $nin: [null, ""] } })
        .populate("uploadedBy", "name")
        .sort({ createdAt: -1 })
        .limit(200)
        .lean(),
    ]);

    const byStation = {};
    for (const f of withStation) {
      const slug = f.stationSlug || "other";
      if (!byStation[slug]) byStation[slug] = [];
      if (byStation[slug].length < 24) byStation[slug].push(mapFilmCard(f));
    }

    if (featured.length === 0 && trending.length) {
      featured.push(...trending.slice(0, 6));
    }

    return res.json({
      ok: true,
      featured: (featured.length ? featured : trending.slice(0, 8)).map(mapFilmCard),
      trending: trending.map(mapFilmCard),
      newReleases: newReleases.map(mapFilmCard),
      byStation,
    });
  } catch (err) {
    console.error("[PowerStream] catalog", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Alias: GET /api/powerstream/film/:id (singular)
router.get("/film/:id", async (req, res) => {
  req.url = `/films/${req.params.id}`;
  return router.handle(req, res);
});

router.get("/film/:id/access", requireAuth, async (req, res) => {
  try {
    const film = await Film.findById(req.params.id).lean();
    if (!film) return res.status(404).json({ ok: false, unlocked: false });
    const free =
      !(film.priceCents > 0) && !film.requiresSubscription;
    if (free) return res.json({ ok: true, unlocked: true, reason: "free" });
    const ent = await Entitlement.findOne({
      userId: req.user._id,
      entitlementType: "ppv",
      contentType: "film",
      contentId: film._id,
      active: true,
    }).lean();
    return res.json({
      ok: true,
      unlocked: !!ent,
      priceCents: film.priceCents || 0,
      requiresSubscription: !!film.requiresSubscription,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

router.post("/films", requireAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      videoUrl,
      posterUrl,
      stationSlug,
      priceCents,
      requiresSubscription,
      category,
      creatorName,
    } = req.body || {};
    if (!title || !videoUrl) {
      return res.status(400).json({ ok: false, error: "title and videoUrl required" });
    }
    const film = await Film.create({
      title,
      description: description || "",
      videoUrl,
      posterUrl: posterUrl || "",
      stationSlug: stationSlug || "",
      priceCents: Math.max(0, parseInt(priceCents, 10) || 0),
      requiresSubscription: !!requiresSubscription,
      category: category || "Independent",
      creatorName: creatorName || req.user.name,
      uploadedBy: req.user._id,
      isPublished: true,
      featured: false,
    });
    return res.status(201).json({ ok: true, film: mapFilmCard(film.toObject()) });
  } catch (e) {
    console.error("[PowerStream] create film", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;












