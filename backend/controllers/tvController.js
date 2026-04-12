import Station from "../models/Station.js";

/**
 * GET /api/vod
 * Returns flattened station videos for VOD shelves.
 */
export async function getVOD(req, res) {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const stationId = req.query.stationId;

    const query = stationId
      ? { $or: [{ _id: stationId }, { slug: stationId }] }
      : {};

    const stations = await Station.find(query)
      .select("name slug videos")
      .lean();

    const items = [];
    for (const st of stations) {
      for (const v of st.videos || []) {
        items.push({
          id: String(v._id || `${st.slug}-${Math.random().toString(36).slice(2, 8)}`),
          stationSlug: st.slug,
          stationName: st.name,
          title: v.title || "Untitled",
          description: v.description || "",
          thumbnailUrl: v.thumbnailUrl || v.thumbnail || "",
          videoUrl: v.videoUrl || v.url || "",
          uploadedAt: v.uploadedAt || null,
        });
      }
    }

    const sorted = items
      .sort((a, b) => new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime())
      .slice(0, limit);

    return res.json({ ok: true, vod: sorted, total: sorted.length });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message, vod: [] });
  }
}

export default { getVOD };
