import React from "react";
import NoLimitStation from "../../../../pages/tv/NoLimit.jsx";
/**
 * No Limit Gangsta TV — canonical implementation lives under components/tv/stations.
 * Uses registry slug `nolimit-gangsta` for branding; VOD/schedule data follows `nolimit` until split in Supabase.
 */
export default function NoLimitGangstaTV() {
  return <NoLimitStation stationSlug="nolimit-gangsta" dataSlug="nolimit" />;
}
