/**
 * Single entry for /tv/:stationSlug — branded pages from pages/tv + stations,
 * otherwise shared 24/7 channel shell (StationChannelPage).
 */
import { useParams } from "react-router-dom";
import NoLimit from "./NoLimit.jsx";
import NoLimitForever from "./NoLimitForever.jsx";
import TexasGotTalent from "./TexasGotTalent.jsx";
import CivicConnect from "./CivicConnect.jsx";
import Worldwide from "./Worldwide.jsx";
import SouthernPowerMusic from "./SouthernPowerMusic.jsx";
import NoLimitGangstaTV from "../../components/tv/stations/NoLimitGangstaTV/index.js";
import StationChannelPage from "../StationChannelPage.jsx";
import GasGodTV from "../GasGodTV.jsx";

const BRANDED_BY_SLUG = {
  nolimit: NoLimit,
  "nolimit-gangsta": NoLimitGangstaTV,
  "nolimit-forever": NoLimitForever,
  "texas-got-talent": TexasGotTalent,
  "civic-connect": CivicConnect,
  worldwide: Worldwide,
  "southern-power-music": SouthernPowerMusic,
  "gas-god-tv": GasGodTV,
};

export default function StationEntry() {
  const { stationSlug } = useParams();
  const Cmp = stationSlug ? BRANDED_BY_SLUG[stationSlug] : null;
  if (Cmp) return <Cmp />;
  return <StationChannelPage />;
}
