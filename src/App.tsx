import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Song, Playlist, RepeatMode } from './types/music.js';
import { getNextTrack, getPreviousTrack } from './utils/audioQueue.js';
import { Header } from './components/Header.js';
import { HeroSection } from './components/HeroSection.js';
import { SongCard } from './components/SongCard.js';
import { MusicPlayer } from './components/MusicPlayer.js';
import { QueueDrawer } from './components/QueueDrawer.js';
import { ShareModal } from './components/ShareModal.js';
import { AdminModal } from './components/AdminModal.js';
import { PlaylistsView } from './components/PlaylistsView.js';
import { FavoritesView } from './components/FavoritesView.js';
import { ExploreView } from './components/ExploreView.js';
import { AboutSection } from './components/AboutSection.js';
import {
  Sparkles,
  Flame,
  TrendingUp,
  Heart,
  Disc,
  Headphones,
  Mail,
  Phone,
  ShieldCheck,
  Compass,
} from 'lucide-react';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<'home' | 'explore' | 'all-songs' | 'playlists' | 'favorites' | 'about'>('home');
  const [searchQuery, setSearchQuery] = useState('');

  // Songs & Playlists from backend
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Audio Playback State
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffle, setIsShuffle] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);

  // User Favorites & History (Stored in LocalStorage & synced with API)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dm_favorites');
      return saved ? JSON.parse(saved) : ['dm-001', 'dm-004'];
    } catch {
      return ['dm-001', 'dm-004'];
    }
  });

  // Admin Session State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('dm_admin_token') || null;
  });

  // UI Modals & Drawers
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [shareSong, setShareSong] = useState<Song | null>(null);

  // Fetch initial songs & playlists
  const fetchData = useCallback(async () => {
    try {
      const [songsRes, plRes] = await Promise.all([
        fetch('/api/songs'),
        fetch('/api/playlists'),
      ]);

      if (songsRes.ok) {
        const songsData: Song[] = await songsRes.json();
        setSongs(songsData);
        if (songsData.length > 0 && !currentSong) {
          // Initialize queue with default songs
          setQueue(songsData);
          setCurrentSong(songsData[0]);
        }
      }

      if (plRes.ok) {
        const plData: Playlist[] = await plRes.json();
        setPlaylists(plData);
      }
    } catch (err) {
      console.warn('Backend data load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentSong]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Check URL params for direct shareable link (?song=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const songId = params.get('song');
    if (songId && songs.length > 0) {
      const target = songs.find((s) => s.id === songId);
      if (target) {
        setCurrentSong(target);
        setIsPlaying(true);
      }
    }
  }, [songs]);

  // Sync favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dm_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [favorites]);

  // Verify Admin Token on mount if available
  useEffect(() => {
    if (adminToken) {
      fetch('/api/admin/verify', {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
        .then((res) => {
          if (res.ok) {
            setIsAdminLoggedIn(true);
          } else {
            localStorage.removeItem('dm_admin_token');
            setAdminToken(null);
            setIsAdminLoggedIn(false);
          }
        })
        .catch(() => {
          setIsAdminLoggedIn(false);
        });
    }
  }, [adminToken]);

  // Audio Playback Handlers
  const handlePlaySong = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      // Ensure song is in queue
      if (!queue.some((s) => s.id === song.id)) {
        setQueue((prev) => [song, ...prev]);
      }
    }
  };

  const handleNextTrack = () => {
    const next = getNextTrack(queue, currentSong?.id || null, repeatMode, isShuffle);
    if (next) {
      setCurrentSong(next);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePreviousTrack = () => {
    const prev = getPreviousTrack(queue, currentSong?.id || null);
    if (prev) {
      setCurrentSong(prev);
      setIsPlaying(true);
    }
  };

  const handleCycleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const handleToggleShuffle = () => {
    setIsShuffle((prev) => !prev);
  };

  // Toggle Favorite
  const handleToggleFavorite = async (songId: string) => {
    const isFav = favorites.includes(songId);
    const newFavorites = isFav
      ? favorites.filter((id) => id !== songId)
      : [...favorites, songId];
    setFavorites(newFavorites);

    // Sync like count with backend
    try {
      await fetch(`/api/songs/${songId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isFav ? 'unlike' : 'like' }),
      });

      // Update local song list likes count
      setSongs((prev) =>
        prev.map((s) =>
          s.id === songId
            ? { ...s, likes: Math.max(0, s.likes + (isFav ? -1 : 1)) }
            : s
        )
      );
    } catch (err) {
      console.warn('Like sync error:', err);
    }
  };

  // Record Measurable Play (Only when actually listened!)
  const handleRecordPlay = async (songId: string) => {
    try {
      const res = await fetch(`/api/songs/${songId}/play`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSongs((prev) =>
          prev.map((s) => (s.id === songId ? { ...s, plays: data.plays } : s))
        );
      }
    } catch (err) {
      console.warn('Play tracking error:', err);
    }
  };

  // Playlist management
  const handleCreatePlaylist = async (name: string, description: string) => {
    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, songIds: [] }),
      });
      if (res.ok) {
        const newPl = await res.json();
        setPlaylists((prev) => [...prev, newPl]);
      }
    } catch (err) {
      console.warn('Playlist creation failed:', err);
    }
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    try {
      const res = await fetch(`/api/playlists/${playlistId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
      }
    } catch (err) {
      console.warn('Playlist deletion failed:', err);
    }
  };

  const handleAddToPlaylist = async (playlistId: string, songId: string) => {
    const pl = playlists.find((p) => p.id === playlistId);
    if (!pl) return;
    if (pl.songIds.includes(songId)) {
      alert('This song is already in the playlist!');
      return;
    }

    const updatedIds = [...pl.songIds, songId];
    try {
      const res = await fetch(`/api/playlists/${playlistId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songIds: updatedIds }),
      });
      if (res.ok) {
        setPlaylists((prev) =>
          prev.map((p) => (p.id === playlistId ? { ...p, songIds: updatedIds } : p))
        );
      }
    } catch (err) {
      console.warn('Playlist update failed:', err);
    }
  };

  const handlePlayEntirePlaylist = (playlist: Playlist) => {
    const playlistSongs = playlist.songIds
      .map((id) => songs.find((s) => s.id === id))
      .filter((s): s is Song => Boolean(s));

    if (playlistSongs.length > 0) {
      setQueue(playlistSongs);
      setCurrentSong(playlistSongs[0]);
      setIsPlaying(true);
    }
  };

  const handlePlayAllFavorites = (favoriteSongs: Song[]) => {
    if (favoriteSongs.length > 0) {
      setQueue(favoriteSongs);
      setCurrentSong(favoriteSongs[0]);
      setIsPlaying(true);
    }
  };

  // Queue modification
  const handleRemoveFromQueue = (songId: string) => {
    setQueue((prev) => prev.filter((s) => s.id !== songId));
  };

  const handleClearQueue = () => {
    setQueue(currentSong ? [currentSong] : []);
  };

  // Admin login success
  const handleAdminLoginSuccess = (token: string) => {
    setAdminToken(token);
    setIsAdminLoggedIn(true);
    localStorage.setItem('dm_admin_token', token);
  };

  const handleAdminLogout = async () => {
    if (adminToken) {
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      }).catch(() => {});
    }
    localStorage.removeItem('dm_admin_token');
    setAdminToken(null);
    setIsAdminLoggedIn(false);
  };

  // Filtered categories for Home page
  const trendingSongs = useMemo(() => songs.filter((s) => s.isTrending), [songs]);
  const popularSongs = useMemo(
    () => [...songs].sort((a, b) => b.plays - a.plays).slice(0, 6),
    [songs]
  );
  const recentlyAddedSongs = useMemo(
    () =>
      [...songs]
        .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
        .slice(0, 6),
    [songs]
  );
  const recommendedSongs = useMemo(
    () => songs.filter((s) => s.isRecommended).slice(0, 6),
    [songs]
  );
  const totalPlaysCount = useMemo(
    () => songs.reduce((acc, s) => acc + (s.plays || 0), 0),
    [songs]
  );

  return (
    <div className="min-h-screen bg-[#10091F] text-white flex flex-col selection:bg-[#FF4FA3] selection:text-white pb-32">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab: any) => setCurrentTab(tab)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        favoritesCount={favorites.length}
        playlistsCount={playlists.length}
        queueCount={queue.length}
        onToggleQueue={() => setIsQueueOpen(!isQueueOpen)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full" id="main-content">
        {/* VIEW 1: HOME */}
        {currentTab === 'home' && (
          <div>
            {/* Hero Section with 3D Scene */}
            <HeroSection
              onPlayTrending={() => {
                if (trendingSongs.length > 0) {
                  setQueue(trendingSongs);
                  setCurrentSong(trendingSongs[0]);
                  setIsPlaying(true);
                } else if (songs.length > 0) {
                  setCurrentSong(songs[0]);
                  setIsPlaying(true);
                }
              }}
              onExplore={() => setCurrentTab('explore')}
              trendingCount={trendingSongs.length}
              totalPlays={totalPlaysCount}
              isPlaying={isPlaying}
              featuredSong={currentSong || songs[0]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 py-6">
              {/* Recently Added Section */}
              <section aria-labelledby="heading-recent">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-pink-500/20 text-[#FF4FA3]">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 id="heading-recent" className="font-display font-extrabold text-2xl text-white">
                        Recently Added
                      </h2>
                      <p className="text-xs text-gray-400">Fresh productions from Dhanjay Mahato</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentTab('all-songs')}
                    className="text-xs font-bold text-pink-300 hover:text-white transition"
                  >
                    View All &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {recentlyAddedSongs.slice(0, 4).map((song) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      isCurrentSong={currentSong?.id === song.id}
                      isPlaying={isPlaying}
                      isFavorite={favorites.includes(song.id)}
                      onPlay={handlePlaySong}
                      onToggleFavorite={handleToggleFavorite}
                      onShare={setShareSong}
                      playlists={playlists}
                      onAddToPlaylist={handleAddToPlaylist}
                    />
                  ))}
                </div>
              </section>

              {/* Trending Songs Section */}
              <section aria-labelledby="heading-trending">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-pink-500/20 text-[#FF4FA3]">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 id="heading-trending" className="font-display font-extrabold text-2xl text-white">
                        Trending Songs
                      </h2>
                      <p className="text-xs text-gray-400">Pulsating top tracks with highest engagement</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentTab('explore')}
                    className="text-xs font-bold text-pink-300 hover:text-white transition"
                  >
                    See Charts &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {trendingSongs.slice(0, 4).map((song) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      isCurrentSong={currentSong?.id === song.id}
                      isPlaying={isPlaying}
                      isFavorite={favorites.includes(song.id)}
                      onPlay={handlePlaySong}
                      onToggleFavorite={handleToggleFavorite}
                      onShare={setShareSong}
                      playlists={playlists}
                      onAddToPlaylist={handleAddToPlaylist}
                    />
                  ))}
                </div>
              </section>

              {/* Popular Music Section */}
              <section aria-labelledby="heading-popular">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 id="heading-popular" className="font-display font-extrabold text-2xl text-white">
                        Popular Music
                      </h2>
                      <p className="text-xs text-gray-400">Most listened electronic and synth streams</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentTab('all-songs')}
                    className="text-xs font-bold text-purple-300 hover:text-white transition"
                  >
                    Explore All &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {popularSongs.slice(0, 4).map((song) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      isCurrentSong={currentSong?.id === song.id}
                      isPlaying={isPlaying}
                      isFavorite={favorites.includes(song.id)}
                      onPlay={handlePlaySong}
                      onToggleFavorite={handleToggleFavorite}
                      onShare={setShareSong}
                      playlists={playlists}
                      onAddToPlaylist={handleAddToPlaylist}
                    />
                  ))}
                </div>
              </section>

              {/* Recommended Songs Section */}
              <section aria-labelledby="heading-recommended">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300">
                      <Headphones className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 id="heading-recommended" className="font-display font-extrabold text-2xl text-white">
                        Recommended Songs
                      </h2>
                      <p className="text-xs text-gray-400">Hand-curated auditory gems chosen by Dhanjay Mahato</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {recommendedSongs.slice(0, 4).map((song) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      isCurrentSong={currentSong?.id === song.id}
                      isPlaying={isPlaying}
                      isFavorite={favorites.includes(song.id)}
                      onPlay={handlePlaySong}
                      onToggleFavorite={handleToggleFavorite}
                      onShare={setShareSong}
                      playlists={playlists}
                      onAddToPlaylist={handleAddToPlaylist}
                    />
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* VIEW 2: EXPLORE */}
        {currentTab === 'explore' && (
          <ExploreView
            title="Explore Sound Dimensions"
            songs={songs}
            searchQuery={searchQuery}
            currentSong={currentSong}
            isPlaying={isPlaying}
            favorites={favorites}
            onPlaySong={handlePlaySong}
            onToggleFavorite={handleToggleFavorite}
            onShare={setShareSong}
            playlists={playlists}
            onAddToPlaylist={handleAddToPlaylist}
          />
        )}

        {/* VIEW 3: ALL SONGS */}
        {currentTab === 'all-songs' && (
          <ExploreView
            title="All Songs Catalog"
            songs={songs}
            searchQuery={searchQuery}
            currentSong={currentSong}
            isPlaying={isPlaying}
            favorites={favorites}
            onPlaySong={handlePlaySong}
            onToggleFavorite={handleToggleFavorite}
            onShare={setShareSong}
            playlists={playlists}
            onAddToPlaylist={handleAddToPlaylist}
          />
        )}

        {/* VIEW 4: PLAYLISTS */}
        {currentTab === 'playlists' && (
          <PlaylistsView
            playlists={playlists}
            allSongs={songs}
            onCreatePlaylist={handleCreatePlaylist}
            onDeletePlaylist={handleDeletePlaylist}
            onPlaySong={handlePlaySong}
            onPlayEntirePlaylist={handlePlayEntirePlaylist}
            currentSong={currentSong}
            isPlaying={isPlaying}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onShare={setShareSong}
            onAddToPlaylist={handleAddToPlaylist}
          />
        )}

        {/* VIEW 5: FAVORITES */}
        {currentTab === 'favorites' && (
          <FavoritesView
            favorites={favorites}
            allSongs={songs}
            onPlaySong={handlePlaySong}
            onPlayAllFavorites={handlePlayAllFavorites}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onToggleFavorite={handleToggleFavorite}
            onShare={setShareSong}
            playlists={playlists}
            onAddToPlaylist={handleAddToPlaylist}
            onNavigateExplore={() => setCurrentTab('explore')}
          />
        )}

        {/* VIEW 6: ABOUT & CONTACT */}
        {currentTab === 'about' && <AboutSection />}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-pink-500/20 bg-[#0C0617] py-12 px-4 sm:px-6 lg:px-8 mt-12 text-xs text-gray-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="font-display font-extrabold text-lg text-white">
              DHANJAY MAHATO
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              Premium 3D futuristic music streaming platform featuring original cyberpunk, synthwave, and electronic soundscapes.
            </p>
            <div className="text-[11px] text-pink-400 font-semibold">
              Neon Pink • Electric Purple • Deep Night
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-white text-xs uppercase tracking-wider mb-3">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setCurrentTab('home')} className="hover:text-pink-300 transition">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('explore')} className="hover:text-pink-300 transition">
                  Explore Charts
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('all-songs')} className="hover:text-pink-300 transition">
                  All Songs
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('playlists')} className="hover:text-pink-300 transition">
                  Playlists
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-white text-xs uppercase tracking-wider mb-3">
              Direct Contact
            </h4>
            <div className="space-y-2.5">
              <div className="font-semibold text-white">DHANJAY MAHATO</div>
              <div>
                <a
                  href="mailto:dhanjaykumar1356@gmail.com"
                  className="hover:text-pink-300 transition flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-[#FF4FA3]" />
                  <span>dhanjaykumar1356@gmail.com</span>
                </a>
              </div>
              <div>
                <a
                  href="tel:9262316710"
                  className="hover:text-purple-300 transition flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-[#7B2CFF]" />
                  <span>+91 9262316710</span>
                </a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-white text-xs uppercase tracking-wider mb-3">
              Security & Audio Cloud
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Protected owner administrative panel with server-side authentication, MP3/WAV uploads, and persistent cloud storage.
            </p>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-pink-300 hover:text-white font-bold"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isAdminLoggedIn ? 'Owner Panel Active' : 'Owner Admin Login'}</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <div>
            &copy; 2026 DHANJAY MAHATO. All audio rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Accurate Listener Counts</span>
            <span>•</span>
            <span>3D Interactive Vinyl</span>
            <span>•</span>
            <span>High-Fidelity Audio</span>
          </div>
        </div>
      </footer>

      {/* Sticky Bottom Music Player */}
      <MusicPlayer
        currentSong={currentSong}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onNext={handleNextTrack}
        onPrevious={handlePreviousTrack}
        onSongEnd={handleNextTrack}
        repeatMode={repeatMode}
        onCycleRepeat={handleCycleRepeat}
        isShuffle={isShuffle}
        onToggleShuffle={handleToggleShuffle}
        isFavorite={currentSong ? favorites.includes(currentSong.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onOpenQueue={() => setIsQueueOpen(true)}
        queueLength={queue.length}
        onRecordPlay={handleRecordPlay}
      />

      {/* Queue Drawer */}
      <QueueDrawer
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        queue={queue}
        currentSong={currentSong}
        onPlaySong={(song) => {
          setCurrentSong(song);
          setIsPlaying(true);
        }}
        onRemoveFromQueue={handleRemoveFromQueue}
        onClearQueue={handleClearQueue}
      />

      {/* Share Modal */}
      <ShareModal
        song={shareSong}
        isOpen={Boolean(shareSong)}
        onClose={() => setShareSong(null)}
      />

      {/* Admin Portal Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        isAdminLoggedIn={isAdminLoggedIn}
        adminToken={adminToken}
        onLoginSuccess={handleAdminLoginSuccess}
        onLogout={handleAdminLogout}
        songs={songs}
        onSongCreated={(newSong) => {
          setSongs((prev) => [newSong, ...prev]);
          setQueue((prev) => [newSong, ...prev]);
        }}
        onSongUpdated={(updated) => {
          setSongs((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
          if (currentSong?.id === updated.id) {
            setCurrentSong(updated);
          }
        }}
        onSongDeleted={(deletedId) => {
          setSongs((prev) => prev.filter((s) => s.id !== deletedId));
          setQueue((prev) => prev.filter((s) => s.id !== deletedId));
          if (currentSong?.id === deletedId) {
            const next = songs.find((s) => s.id !== deletedId) || null;
            setCurrentSong(next);
          }
        }}
      />
    </div>
  );
}
