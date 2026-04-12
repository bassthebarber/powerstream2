// backend/routes/distribution/marketplaceRoutes.js
// Marketplace Routes - Distribution listings CRUD
import express from "express";
import MarketplaceListing from "../../models/MarketplaceListing.js";

const router = express.Router();

/**
 * GET /api/distribution/marketplace/listings
 * Return all published listings
 */
router.get("/listings", async (req, res) => {
  try {
    const { type, accessType, limit = 50, page = 1 } = req.query;

    const query = { status: "published" };
    if (type) query.type = type;
    if (accessType) query.accessType = accessType;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const listings = await MarketplaceListing.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("ownerId", "name email avatarUrl");

    const total = await MarketplaceListing.countDocuments(query);

    res.json({
      ok: true,
      listings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to fetch listings",
      message: error.message,
    });
  }
});

/**
 * GET /api/distribution/marketplace/listings/:id
 * Get a single listing by ID
 */
router.get("/listings/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await MarketplaceListing.findById(id)
      .populate("ownerId", "name email avatarUrl");

    if (!listing) {
      return res.status(404).json({
        ok: false,
        error: "Listing not found",
      });
    }

    res.json({
      ok: true,
      listing,
    });
  } catch (error) {
    console.error("Error fetching listing:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to fetch listing",
      message: error.message,
    });
  }
});

/**
 * POST /api/distribution/marketplace/listings
 * Create a new listing
 */
router.post("/listings", async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      ownerId,
      price,
      accessType,
      status,
      thumbnailUrl,
    } = req.body;

    if (!title || !type || !ownerId) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields: title, type, ownerId",
      });
    }

    const listing = new MarketplaceListing({
      title,
      description,
      type,
      ownerId,
      price: price || 0,
      accessType: accessType || "free",
      status: status || "draft",
      thumbnailUrl,
    });

    await listing.save();

    res.status(201).json({
      ok: true,
      listing,
      message: "Listing created successfully",
    });
  } catch (error) {
    console.error("Error creating listing:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to create listing",
      message: error.message,
    });
  }
});

/**
 * PATCH /api/distribution/marketplace/listings/:id
 * Update a listing
 */
router.patch("/listings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.createdAt;
    delete updates.ownerId;

    const listing = await MarketplaceListing.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );

    if (!listing) {
      return res.status(404).json({
        ok: false,
        error: "Listing not found",
      });
    }

    res.json({
      ok: true,
      listing,
      message: "Listing updated successfully",
    });
  } catch (error) {
    console.error("Error updating listing:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to update listing",
      message: error.message,
    });
  }
});

export default router;










