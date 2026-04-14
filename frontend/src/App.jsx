// src/App.jsx
// PowerStream Main Frontend - App Root Component
// Fixed public-access version so the platform opens without login blocking

import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";

// ============================================
// LAYOUT IMPORTS
// ============================================
import Layout from "./components/Layout.jsx";
import GlobalNav from "./components/GlobalNav.jsx";

// ============================================
// PAGE IMPORTS - Core Social Surfaces
// ============================================
import Home from "./pages/Home.jsx";
import PowerFeed from "./pages/PowerFeed.jsx";
import FeedMenu from "./pages/FeedMenu.jsx";
import PowerGram from "./pages/PowerGram.jsx";
import PowerReel from "./pages/PowerReel.jsx";
import PowerLine from "./pages/PowerLine.jsx";

// ============================================
// PAGE IMPORTS - TV & Stations
// ============================================
import TVStations from "./pages/TVStations.jsx";
import TVGuide from "./pages/TVGuide.jsx";
import ShowDetail from "./pages/ShowDetail.jsx";
import SouthernPower from "./pages/SouthernPower.jsx";
import NoLimitEastHouston from "./pages/NoLimitEastHouston.jsx";
import CivicConnect from "./pages/CivicConnect.jsx";
import TexasGotTalent from "./pages/TexasGotTalent.jsx";
import TVGuidePage from "./pages/TVGuidePage.jsx";
import StationViewPage from "./pages/StationViewPage.jsx";
import WorldTV from "./pages/WorldTV.jsx";
import PowerStreamTV from "./pages/PowerStreamTV/PowerStreamTV.jsx";
import FilmDetailPage from "./pages/PowerStreamTV/FilmDetail.jsx";
import UploadFilm from "./pages/PowerStreamTV/UploadFilm.jsx";
import { TVHome, VideoPlayer } from "./powerstream-tv";
import StationDetail from "./pages/StationDetail.jsx";
import StationPage from "./pages/StationPage.jsx";
import BroadcastControlRoom from "./components/tv/BroadcastControlRoom.jsx";
import StationCatalog from "./components/tv/StationCatalog.jsx";
import StationHome from "./components/tv/StationHome.jsx";
import StationVideoPlayer from "./components/tv/player/StationVideoPlayer.jsx";
import NetflixHome from "./pages/netflix/NetflixHome.jsx";
import MoviePage from "./pages/netflix/MoviePage.jsx";
import UploadMovie from "./pages/netflix/UploadMovie.jsx";
import BrowseMovies from "./pages/netflix/BrowseMovies.jsx";
import MovieDetail from "./pages/netflix/MovieDetail.jsx";
import FilmDetail from "./pages/FilmDetail.jsx";

// ============================================
// PAGE IMPORTS - Auth
// Redirect these back home for now
// ============================================
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";

// ============================================
// PAGE IMPORTS - Studio
// ============================================
import Studio from "./pages/Studio.jsx";
import AIBrain from "./pages/AIBrain.jsx";
import RecordingStudio from "./pages/RecordingStudio.jsx";
import StudioRoyaltyPage from "./pages/studio/StudioRoyaltyPage.jsx";
import StudioLibraryPage from "./pages/studio/StudioLibraryPage.jsx";
import StudioSettingsPage from "./pages/studio/StudioSettingsPage.jsx";
import StudioBeatPage from "./pages/studio/StudioBeatPage.jsx";
import StudioExportPage from "./pages/studio/StudioExportPage.jsx";
import StudioHubPage from "./pages/studio/StudioHubPage.jsx";
import StudioRecordPage from "./pages/studio/StudioRecordPage.jsx";
import StudioMixPage from "./pages/studio/StudioMixPage.jsx";
import StudioMasterPage from "./pages/studio/StudioMasterPage.jsx";
import StudioAIBeatPage from "./pages/studio/StudioAIBeatPage.jsx";
import StudioLiveRoomPage from "./pages/studio/StudioLiveRoomPage.jsx";
import StudioTVExportPage from "./pages/studio/StudioTVExportPage.jsx";
import StudioVoicePage from "./pages/studio/StudioVoicePage.jsx";
import StudioVisualizerPage from "./pages/studio/StudioVisualizerPage.jsx";
import StudioPlayerPage from "./pages/studio/StudioPlayerPage.jsx";
import StudioUploadsPage from "./pages/studio/StudioUploadsPage.jsx";

// ============================================
// PAGE IMPORTS - Menu Pages
// ============================================
import {
  FriendsPage,
  GroupsPage,
  MarketplacePage,
  MemoriesPage,
  SavedPage,
  EventsPage,
  GamesPage,
  WatchPage,
  PagesPage,
  JobsPage,
  SupportPage,
  SettingsPage,
  AnalyticsPage,
  ProfilePage,
} from "./pages/menu";

// ============================================
// PAGE IMPORTS - PowerHarmony
// ============================================
import {
  PowerHarmonyMaster,
  PowerHarmonyWrite,
  PowerHarmonyLive,
  PowerHarmonyVocal,
  PowerHarmonyMix,
  PowerHarmonyMastering,
  PowerHarmonyRecord,
} from "./pages/powerharmony";

// ============================================
// PAGE IMPORTS - Networks
// ============================================
import ChurchNetworkHome from "./church/ChurchNetworkHome.jsx";
import ChurchStationPage from "./church/ChurchStationPage.jsx";
import {
  ChurchNetworkHome as ChurchNetworkHomePage,
  ChurchStation,
} from "./church-network";
import SchoolNetworkHome from "./schools/SchoolNetworkHome.jsx";
import SchoolStationPage from "./schools/SchoolStationPage.jsx";
import {
  SchoolNetworkHome as SchoolNetworkHomePage,
  SchoolStation,
} from "./school-network";
import { NLFStationHome, NLFVideoPlayer, NLFGuide } from "./nlf-tv";

// ============================================
// PAGE IMPORTS - Southern Power Network TV
// ============================================
import SouthernPowerNetwork from "./pages/SouthernPowerNetwork.jsx";
import {
  NoLimit as NoLimitTV,
  NoLimitForever as NoLimitForeverTV,
  TexasGotTalent as TexasGotTalentTV,
  CivicConnect as CivicConnectTV,
  Worldwide as WorldwideTV,
  SouthernPowerMusic as SouthernPowerMusicTV,
} from "./pages/tv";
import StationEntry from "./pages/tv/StationEntry.jsx";

// ============================================
// PAGE IMPORTS - Audio & Music
// ============================================
import NoLimitAudio from "./pages/NoLimitAudio.jsx";
import ArtistAudioUpload from "./pages/ArtistAudioUpload.jsx";
import MusicLibrary from "./pages/MusicLibrary.jsx";

// ============================================
// PAGE IMPORTS - Profile & Misc
// ============================================
import Profile from "./pages/Profile.jsx";
import MultistreamDashboard from "./pages/MultistreamDashboard.jsx";

// ============================================
// STYLE IMPORTS
// ============================================
import "./styles/powerharmony.css";
import "./styles/responsive.css";
import "./styles/mobile-responsive.css";
import "./styles/studio-mobile.css";

// ============================================
// 404 NOT FOUND COMPONENT
// ============================================
const NotFound = () => (
  <div className="ps-page ps-not-found">
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <Link to="/" className="ps-back">
      ← Back to Home
    </Link>
  </div>
);

// ============================================
// HELPERS
// ============================================
const withLayout = (node) => <Layout>{node}</Layout>;

// ============================================
// MAIN APP COMPONENT
// ============================================
export default function App() {
  return (
    <div className="ps-app">
      <GlobalNav />

      <main className="ps-main">
        <Routes>
          {/* ========== PUBLIC ENTRY ========== */}
          <Route path="/" element={<Home />} />

          {/* Redirect auth pages back into platform */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/signup" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          <Route path="/forgot-password" element={<Navigate to="/" replace />} />

          {/* Optional direct access if you still want to keep the components available */}
          <Route path="/login-page" element={<LoginPage />} />
          <Route path="/register-page" element={<RegisterPage />} />
          <Route path="/forgot-password-page" element={<ForgotPasswordPage />} />

          {/* ========== PROFILE ROUTES ========== */}
          <Route path="/profile/:id" element={withLayout(<Profile />)} />
          <Route path="/profile" element={withLayout(<Profile />)} />
          <Route path="/settings/profile" element={withLayout(<SettingsPage />)} />

          {/* ========== SOCIAL SURFACES ========== */}
          <Route path="/powerfeed" element={withLayout(<PowerFeed />)} />
          <Route path="/feed" element={withLayout(<PowerFeed />)} />
          <Route path="/feed/menu" element={withLayout(<FeedMenu />)} />
          <Route path="/powergram" element={withLayout(<PowerGram />)} />
          <Route path="/gram" element={withLayout(<PowerGram />)} />
          <Route path="/powerreel" element={withLayout(<PowerReel />)} />
          <Route path="/reel" element={withLayout(<PowerReel />)} />
          <Route path="/powerline" element={withLayout(<PowerLine />)} />
          <Route path="/line" element={withLayout(<PowerLine />)} />

          {/* ========== MENU PAGES ========== */}
          <Route path="/feed/friends" element={<FriendsPage />} />
          <Route path="/feed/groups" element={<GroupsPage />} />
          <Route path="/feed/marketplace" element={<MarketplacePage />} />
          <Route path="/feed/memories" element={<MemoriesPage />} />
          <Route path="/feed/saved" element={<SavedPage />} />
          <Route path="/feed/events" element={<EventsPage />} />
          <Route path="/feed/games" element={<GamesPage />} />
          <Route path="/feed/watch" element={<WatchPage />} />
          <Route path="/feed/pages" element={<PagesPage />} />
          <Route path="/feed/jobs" element={<JobsPage />} />
          <Route path="/feed/support" element={<SupportPage />} />
          <Route path="/feed/settings" element={<SettingsPage />} />
          <Route path="/feed/analytics" element={<AnalyticsPage />} />
          <Route path="/feed/profile" element={<ProfilePage />} />

          {/* ========== TV STATIONS ========== */}
          <Route path="/tv-stations" element={withLayout(<TVStations />)} />
          <Route path="/stations" element={withLayout(<TVStations />)} />
          <Route path="/tv-stations/:slug" element={withLayout(<StationDetail />)} />
          <Route path="/stations/:slug" element={withLayout(<StationViewPage />)} />
          <Route path="/tv-guide" element={withLayout(<TVGuide />)} />
          <Route path="/tvguide" element={withLayout(<TVGuidePage />)} />
          <Route path="/shows/:id" element={withLayout(<ShowDetail />)} />

          {/* ========== STATION PAGES ========== */}
          <Route path="/southern-power" element={withLayout(<SouthernPower />)} />
          <Route path="/sps" element={withLayout(<SouthernPower />)} />
          <Route
            path="/NoLimitEastHouston"
            element={withLayout(<NoLimitEastHouston />)}
          />
          <Route path="/civic-connect" element={withLayout(<CivicConnect />)} />
          <Route
            path="/texas-got-talent"
            element={withLayout(<TexasGotTalent />)}
          />

          {/* ========== NETFLIX-STYLE TV ========== */}
          <Route path="/tv" element={withLayout(<NetflixHome />)} />
          <Route path="/tv/movie/:id" element={withLayout(<MoviePage />)} />
          <Route path="/tv/upload" element={withLayout(<UploadMovie />)} />
          <Route path="/tv/browse" element={withLayout(<BrowseMovies />)} />
          <Route path="/tv/movies/:id" element={withLayout(<MovieDetail />)} />
          <Route path="/tv/stations/:slug" element={withLayout(<StationPage />)} />
          <Route
            path="/tv/:stationId/catalog"
            element={withLayout(<StationCatalog />)}
          />
          <Route path="/tv/:stationId/home" element={withLayout(<StationHome />)} />
          <Route
            path="/tv/:stationId/watch/:videoId"
            element={<StationVideoPlayer />}
          />
          <Route
            path="/broadcast/control/:slug"
            element={withLayout(<BroadcastControlRoom />)}
          />

          {/* ========== WORLD TV & POWERSTREAM TV ========== */}
          <Route path="/world-tv" element={withLayout(<WorldTV />)} />
          <Route path="/worldwide-tv" element={withLayout(<WorldTV />)} />
          <Route path="/powerstream-tv" element={withLayout(<PowerStreamTV />)} />
          <Route path="/ps-tv" element={withLayout(<PowerStreamTV />)} />
          <Route path="/powerstream" element={<TVHome />} />
          <Route path="/powerstream/watch/:id" element={<VideoPlayer />} />
          <Route
            path="/powerstream-tv/title/:id"
            element={withLayout(<FilmDetail />)}
          />
          <Route
            path="/powerstream-tv/film/:id"
            element={withLayout(<FilmDetailPage />)}
          />
          <Route
            path="/powerstream-tv/upload"
            element={withLayout(<UploadFilm />)}
          />
          <Route
            path="/tv/:stationSlug/upload"
            element={withLayout(<UploadFilm />)}
          />
          <Route path="/ps-tv/title/:id" element={withLayout(<FilmDetail />)} />

          {/* ========== STUDIO ROUTES ========== */}
          <Route path="/studio" element={withLayout(<Studio />)} />
          <Route path="/recording-studio" element={<RecordingStudio />} />
          <Route path="/studio/hub" element={withLayout(<StudioHubPage />)} />
          <Route path="/studio/record" element={withLayout(<StudioRecordPage />)} />
          <Route path="/studio/beats" element={withLayout(<StudioBeatPage />)} />
          <Route
            path="/studio/ai-beat"
            element={withLayout(<StudioAIBeatPage />)}
          />
          <Route
            path="/studio/library"
            element={withLayout(<StudioLibraryPage />)}
          />
          <Route path="/studio/mix" element={withLayout(<StudioMixPage />)} />
          <Route path="/studio/master" element={withLayout(<StudioMasterPage />)} />
          <Route
            path="/studio/export"
            element={withLayout(<StudioExportPage />)}
          />
          <Route
            path="/studio/royalty"
            element={withLayout(<StudioRoyaltyPage />)}
          />
          <Route
            path="/studio/settings"
            element={withLayout(<StudioSettingsPage />)}
          />
          <Route
            path="/studio/live-room"
            element={withLayout(<StudioLiveRoomPage />)}
          />
          <Route
            path="/studio/live-room/:roomId"
            element={withLayout(<StudioLiveRoomPage />)}
          />
          <Route
            path="/studio/tv-export"
            element={withLayout(<StudioTVExportPage />)}
          />
          <Route path="/studio/voice" element={withLayout(<StudioVoicePage />)} />
          <Route
            path="/studio/visualizer"
            element={withLayout(<StudioVisualizerPage />)}
          />
          <Route path="/studio/player" element={withLayout(<StudioPlayerPage />)} />
          <Route
            path="/studio/uploads"
            element={withLayout(<StudioUploadsPage />)}
          />

          {/* ========== POWERHARMONY ROUTES ========== */}
          <Route path="/powerharmony/master" element={<PowerHarmonyMaster />} />
          <Route path="/powerharmony/write" element={<PowerHarmonyWrite />} />
          <Route path="/powerharmony/writing" element={<PowerHarmonyWrite />} />
          <Route path="/powerharmony/live" element={<PowerHarmonyLive />} />
          <Route path="/powerharmony/vocal" element={<PowerHarmonyVocal />} />
          <Route path="/powerharmony/mix" element={<PowerHarmonyMix />} />
          <Route
            path="/powerharmony/mastering"
            element={<PowerHarmonyMastering />}
          />
          <Route path="/powerharmony/record" element={<PowerHarmonyRecord />} />
          <Route
            path="/powerharmony/royalty"
            element={<StudioRoyaltyPage />}
          />
          <Route
            path="/powerharmony/library"
            element={<StudioLibraryPage />}
          />
          <Route
            path="/powerharmony/settings"
            element={<StudioSettingsPage />}
          />
          <Route path="/powerharmony/beat" element={<StudioBeatPage />} />
          <Route path="/powerharmony/export" element={<StudioExportPage />} />

          {/* ========== NETWORK ROUTES ========== */}
          <Route path="/church" element={<ChurchNetworkHome />} />
          <Route path="/church/:slug" element={<ChurchStationPage />} />
          <Route path="/church-network" element={<ChurchNetworkHomePage />} />
          <Route path="/church/:id" element={<ChurchStation />} />

          <Route path="/schools" element={<SchoolNetworkHome />} />
          <Route path="/schools/:slug" element={<SchoolStationPage />} />
          <Route path="/school-network" element={<SchoolNetworkHomePage />} />
          <Route path="/school/:id" element={<SchoolStation />} />

          {/* ========== NO LIMIT FOREVER TV ========== */}
          <Route path="/nlf" element={<NLFStationHome />} />
          <Route path="/nlf/watch/:id" element={<NLFVideoPlayer />} />
          <Route path="/nlf/guide" element={<NLFGuide />} />
          <Route path="/nlf/videos" element={<NLFStationHome />} />
          <Route path="/nlf/live" element={<NLFVideoPlayer />} />
          <Route
            path="/network/no-limit-forever"
            element={<NoLimitForeverTV />}
          />
          <Route
            path="/network/no-limit-forever/watch/:id"
            element={<NoLimitForeverTV />}
          />

          {/* ========== SOUTHERN POWER NETWORK TV ========== */}
          <Route path="/network/southernpower" element={<SouthernPowerNetwork />} />
          <Route path="/tv/nolimit" element={<NoLimitTV />} />
          <Route path="/tv/nolimit-forever" element={<NoLimitForeverTV />} />
          <Route path="/tv/texas-got-talent" element={<TexasGotTalentTV />} />
          <Route path="/tv/civic-connect" element={<CivicConnectTV />} />
          <Route path="/tv/worldwide" element={<WorldwideTV />} />
          <Route
            path="/tv/southern-power-music"
            element={<SouthernPowerMusicTV />}
          />
          <Route path="/tv/:stationSlug" element={<StationEntry />} />
          <Route path="/tv/:stationSlug/channel" element={<StationEntry />} />

          {/* ========== AUDIO & MUSIC ROUTES ========== */}
          <Route
            path="/stations/no-limit-east-houston/audio"
            element={withLayout(<NoLimitAudio />)}
          />
          <Route path="/no-limit-audio" element={withLayout(<NoLimitAudio />)} />
          <Route path="/music" element={withLayout(<MusicLibrary />)} />
          <Route path="/music-library" element={withLayout(<MusicLibrary />)} />
          <Route
            path="/artist/upload"
            element={withLayout(<ArtistAudioUpload />)}
          />
          <Route
            path="/nolimit/upload/audio"
            element={withLayout(<ArtistAudioUpload />)}
          />

          {/* ========== MISC ROUTES ========== */}
          <Route path="/ai-brain" element={<AIBrain />} />
          <Route path="/multistream" element={<MultistreamDashboard />} />

          {/* ========== 404 FALLBACK ========== */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <style>{`
        :root {
          --bg: #000;
          --panel: #0f0f10;
          --text: #fff;
          --muted: #888;
          --gold: #e6b800;
          --gold-soft: #ffda5c;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .ps-app {
          min-height: 100vh;
        }

        .ps-main {
          padding: 32px 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .ps-page h1 {
          font-size: 2.5rem;
          font-weight: 900;
          margin-bottom: 12px;
          background: linear-gradient(90deg, var(--gold), var(--gold-soft));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ps-subtitle {
          color: var(--muted);
          font-size: 1.1rem;
          margin-bottom: 32px;
        }

        .ps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
        }

        .ps-tile {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          border-radius: 14px;
          background: linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: var(--text);
          text-decoration: none;
          font-weight: 700;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .ps-card {
          background: linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 24px;
        }

        .ps-tile:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
          border-color: rgba(230, 184, 0, 0.3);
        }

        .ps-tile--gold {
          background: linear-gradient(135deg, var(--gold) 0%, #c9a000 100%);
          color: #000;
          border: none;
        }

        .ps-tile--gold:hover {
          filter: brightness(1.1);
        }

        .ps-back {
          display: inline-block;
          margin-top: 24px;
          color: var(--gold);
          text-decoration: none;
          font-weight: 600;
        }

        .ps-back:hover {
          text-decoration: underline;
        }

        .ps-not-found {
          text-align: center;
          padding-top: 100px;
        }

        .ps-welcome-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .ps-logo-spin {
          width: 120px;
          height: 120px;
          margin-bottom: 24px;
          animation: spin 3s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .ps-main {
            padding: 16px;
            padding-bottom: 80px;
          }

          .ps-page h1 {
            font-size: 1.8rem;
          }

          .ps-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 12px;
          }

          .ps-tile {
            padding: 16px 12px;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}

