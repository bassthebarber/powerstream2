import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Branded route — canonical player lives at /watch/:slug for one implementation.
 */
export default function LynnyReddTV() {
  return <Navigate to="/watch/lynny-redd-tv" replace />;
}
