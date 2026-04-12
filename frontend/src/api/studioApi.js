/**
 * Canonical studio HTTP client lives in ../lib/studioApi.js.
 * This file re-exports the same surface so legacy imports from `api/studioApi.js` stay valid.
 */
export {
  listAssets,
  deleteAsset,
  getLibraryItems,
  uploadToStudio,
  aiMix,
  aiMaster,
  requestExport,
  getBeats,
  generateBeat,
  checkStudioHealth,
} from "../lib/studioApi.js";

export { default } from "../lib/studioApi.js";
