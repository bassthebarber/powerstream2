// backend/src/config/cloudinary.js
// Cloudinary integration wrapper.
//
// This project also has a legacy `backend/config/cloudinary.js` file which is
// not a Cloudinary SDK wrapper. We therefore treat it as an optional "central
// module" and keep this wrapper resilient so the server can boot.
import env from "./env.js";
import * as centralModule from "../../config/cloudinary.js";

const cloudinary = {
  config: () => ({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  }),
};

// Legacy exports for backwards compatibility
export const initCloudinary = () => {
  console.log("✅ Cloudinary: configuration wrapper initialized");
  if (typeof centralModule.bootAI === "function") {
    try {
      centralModule.bootAI();
    } catch (err) {
      console.warn("⚠️  Central boot module failed:", err?.message || err);
    }
  }
  return true;
};

export const isCloudinaryConfigured = () => {
  const cfg = cloudinary.config();
  return !!(cfg.cloud_name && cfg.api_key && cfg.api_secret);
};

export default cloudinary;
