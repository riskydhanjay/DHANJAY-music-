import React, { useState, useRef } from 'react';
import {
  X,
  Lock,
  Upload,
  Music,
  Trash2,
  Edit,
  ShieldCheck,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  FileAudio,
  Image as ImageIcon,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import type { Song } from '../types/music.js';
import { formatTime } from '../utils/audioQueue.js';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdminLoggedIn: boolean;
  adminToken: string | null;
  onLoginSuccess: (token: string) => void;
  onLogout: () => void;
  songs: Song[];
  onSongCreated: (song: Song) => void;
  onSongUpdated: (song: Song) => void;
  onSongDeleted: (songId: string) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  isAdminLoggedIn,
  adminToken,
  onLoginSuccess,
  onLogout,
  songs,
  onSongCreated,
  onSongUpdated,
  onSongDeleted,
}) => {
  // Login State
  const [email, setEmail] = useState('dhanjaykumar1356@gmail.com');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Tab: 'upload' | 'manage' | 'storage'
  const [activeTab, setActiveTab] = useState<'upload' | 'manage' | 'storage'>('upload');

  // Upload Form State
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('DHANJAY MAHATO');
  const [album, setAlbum] = useState('Neon Dimensions');
  const [genre, setGenre] = useState('Synthwave');
  const [duration, setDuration] = useState('195');
  const [releaseYear, setReleaseYear] = useState('2026');
  const [description, setDescription] = useState('');
  const [isTrending, setIsTrending] = useState(true);
  const [isPopular, setIsPopular] = useState(false);
  const [isRecommended, setIsRecommended] = useState(true);
  const [customAudioUrl, setCustomAudioUrl] = useState('');
  const [customCoverUrl, setCustomCoverUrl] = useState('');

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit Song State
  const [editingSong, setEditingSong] = useState<Song | null>(null);

  // Storage Stats State
  const [storageStats, setStorageStats] = useState<{
    totalSongs: number;
    totalPlays: number;
    storageUsedBytes: number;
    storageLimitBytes: number;
  } | null>(null);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
      }

      onLoginSuccess(data.token);
      setPassword('');
      fetchStats();
    } catch (err: any) {
      setLoginError(err.message || 'Invalid credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStorageStats(data);
      }
    } catch (err) {
      console.warn('Failed to load stats:', err);
    }
  };

  // Handle Audio File Selection & Auto-detect duration
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      // Auto fill title if empty
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanName);
      }

      // Try reading duration using temporary audio element
      const tempAudio = document.createElement('audio');
      tempAudio.src = URL.createObjectURL(file);
      tempAudio.onloadedmetadata = () => {
        if (tempAudio.duration && !isNaN(tempAudio.duration)) {
          setDuration(Math.round(tempAudio.duration).toString());
        }
      };
    }
  };

  // Handle Song Upload
  const handleUploadSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setUploadMessage({ type: 'error', text: 'Song title is required.' });
      return;
    }

    if (!audioFile && !customAudioUrl.trim()) {
      setUploadMessage({
        type: 'error',
        text: 'Please select an MP3/WAV file or provide a valid audio URL.',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);
    setUploadMessage(null);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('artist', artist.trim() || 'DHANJAY MAHATO');
      formData.append('album', album.trim() || 'Singles');
      formData.append('genre', genre);
      formData.append('duration', duration);
      formData.append('releaseYear', releaseYear);
      formData.append('description', description);
      formData.append('isTrending', String(isTrending));
      formData.append('isPopular', String(isPopular));
      formData.append('isRecommended', String(isRecommended));

      if (audioFile) {
        formData.append('audio', audioFile);
      } else {
        formData.append('customAudioUrl', customAudioUrl.trim());
      }

      if (coverFile) {
        formData.append('cover', coverFile);
      } else if (customCoverUrl.trim()) {
        formData.append('customCoverUrl', customCoverUrl.trim());
      }

      setUploadProgress(50);

      const res = await fetch('/api/admin/songs', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: formData,
      });

      setUploadProgress(90);

      const newSong = await res.json();
      if (!res.ok) {
        throw new Error(newSong.error || 'Failed to upload song.');
      }

      setUploadProgress(100);
      setUploadMessage({
        type: 'success',
        text: `Song "${newSong.title}" successfully published & permanently stored!`,
      });

      onSongCreated(newSong);

      // Reset form
      setTitle('');
      setAudioFile(null);
      setCoverFile(null);
      setCustomAudioUrl('');
      setCustomCoverUrl('');
      setDescription('');
      if (audioInputRef.current) audioInputRef.current.value = '';
      if (coverInputRef.current) coverInputRef.current.value = '';

      fetchStats();
    } catch (err: any) {
      setUploadMessage({
        type: 'error',
        text: err.message || 'Error occurred while publishing.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Edit Submit
  const handleUpdateSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSong) return;

    try {
      const res = await fetch(`/api/admin/songs/${editingSong.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(editingSong),
      });

      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error || 'Failed to update song.');

      onSongUpdated(updated);
      setEditingSong(null);
    } catch (err: any) {
      alert(err.message || 'Could not update song.');
    }
  };

  // Handle Delete
  const handleDeleteSong = async (songId: string, songTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${songTitle}"?`)) return;

    try {
      const res = await fetch(`/api/admin/songs/${songId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete song.');
      }

      onSongDeleted(songId);
      fetchStats();
    } catch (err: any) {
      alert(err.message || 'Could not delete song.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Secure Owner Administration Portal"
    >
      <div className="w-full max-w-3xl glass-panel rounded-3xl border border-pink-500/35 bg-[#120924]/98 shadow-2xl p-6 sm:p-8 my-8 text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#FF4FA3] to-[#7B2CFF] shadow-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-lg sm:text-xl text-white">
                DHANJAY MAHATO • SECURE ADMIN
              </h2>
              <p className="text-xs text-pink-300">
                {isAdminLoggedIn
                  ? 'Authenticated as Master Audio Publisher'
                  : 'Owner Credentials Required'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminLoggedIn && (
              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-white/5 transition flex items-center gap-1.5 text-xs"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
              aria-label="Close Admin Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NOT LOGGED IN: Login Form */}
        {!isAdminLoggedIn ? (
          <div className="py-8 max-w-md mx-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-8 h-8 text-[#FF4FA3]" />
              </div>
              <h3 className="font-display font-bold text-xl text-white">Owner Portal Sign In</h3>
              <p className="text-xs text-gray-400 mt-1">
                Access unlimited MP3/WAV audio uploads, cloud storage, and catalog controls.
              </p>
            </div>

            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Owner Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#1A0E33] border border-pink-500/30 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF4FA3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Owner Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password (dhanjay2026!)"
                  required
                  className="w-full bg-[#1A0E33] border border-pink-500/30 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF4FA3]"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-[11px] text-pink-200">
                🔒 Protected by backend token validation. Default password: <code className="text-white font-mono bg-black/40 px-1 py-0.5 rounded">dhanjay2026!</code>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF4FA3] to-[#7B2CFF] text-white font-bold text-sm tracking-wide shadow-lg shadow-pink-500/20 hover:opacity-95 active:scale-98 transition disabled:opacity-50 glow-pink"
              >
                {isLoggingIn ? 'Authenticating...' : 'Sign In as Owner'}
              </button>
            </form>
          </div>
        ) : (
          /* LOGGED IN: Dashboard View */
          <div className="py-4">
            {/* Nav Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-6">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
                  activeTab === 'upload'
                    ? 'bg-gradient-to-r from-[#FF4FA3]/30 to-[#7B2CFF]/30 text-white border border-[#FF4FA3]/50'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Upload className="w-4 h-4 text-pink-400" />
                Upload New Song
              </button>

              <button
                onClick={() => setActiveTab('manage')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
                  activeTab === 'manage'
                    ? 'bg-gradient-to-r from-[#FF4FA3]/30 to-[#7B2CFF]/30 text-white border border-[#FF4FA3]/50'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Music className="w-4 h-4 text-purple-400" />
                Manage Songs ({songs.length})
              </button>

              <button
                onClick={() => {
                  setActiveTab('storage');
                  fetchStats();
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
                  activeTab === 'storage'
                    ? 'bg-gradient-to-r from-[#FF4FA3]/30 to-[#7B2CFF]/30 text-white border border-[#FF4FA3]/50'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <HardDrive className="w-4 h-4 text-teal-400" />
                Storage & Stats
              </button>
            </div>

            {/* TAB 1: UPLOAD SONG */}
            {activeTab === 'upload' && (
              <form onSubmit={handleUploadSong} className="space-y-4">
                {uploadMessage && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                      uploadMessage.type === 'success'
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                        : 'bg-red-500/20 border-red-500/40 text-red-200'
                    }`}
                  >
                    {uploadMessage.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    )}
                    <span>{uploadMessage.text}</span>
                  </div>
                )}

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-1.5 p-3 rounded-xl bg-pink-500/10 border border-pink-500/30">
                    <div className="flex justify-between text-xs text-pink-300 font-semibold">
                      <span>Publishing & Storing to Cloud Database...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#1A0E33] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF4FA3] to-[#7B2CFF] transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File Upload 1: Audio File (MP3/WAV) */}
                  <div className="p-4 rounded-2xl bg-[#1A0E33] border border-pink-500/30 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-pink-300 mb-2">
                        <FileAudio className="w-4 h-4" />
                        <span>Select MP3 / WAV Audio File</span>
                      </div>
                      <input
                        ref={audioInputRef}
                        type="file"
                        accept="audio/mp3,audio/wav,audio/ogg,audio/m4a,audio/*,.mp3,.wav"
                        onChange={handleAudioChange}
                        className="w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-pink-500/20 file:text-pink-300 hover:file:bg-pink-500/30 cursor-pointer"
                      />
                      {audioFile && (
                        <p className="text-[11px] text-emerald-400 mt-2 truncate">
                          Selected: {audioFile.name} ({(audioFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/5">
                      <label className="text-[10px] text-gray-400 block mb-1">
                        Or enter direct Audio URL:
                      </label>
                      <input
                        type="url"
                        value={customAudioUrl}
                        onChange={(e) => setCustomAudioUrl(e.target.value)}
                        placeholder="https://.../song.mp3"
                        className="w-full bg-[#120824] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* File Upload 2: Album Cover Image */}
                  <div className="p-4 rounded-2xl bg-[#1A0E33] border border-purple-500/30 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-300 mb-2">
                        <ImageIcon className="w-4 h-4" />
                        <span>Select Album Cover Artwork</span>
                      </div>
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/*"
                        onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-500/20 file:text-purple-300 hover:file:bg-purple-500/30 cursor-pointer"
                      />
                      {coverFile && (
                        <p className="text-[11px] text-emerald-400 mt-2 truncate">
                          Selected: {coverFile.name}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/5">
                      <label className="text-[10px] text-gray-400 block mb-1">
                        Or enter direct Cover Image URL:
                      </label>
                      <input
                        type="url"
                        value={customCoverUrl}
                        onChange={(e) => setCustomCoverUrl(e.target.value)}
                        placeholder="https://.../cover.jpg"
                        className="w-full bg-[#120824] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Song Metadata Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Track Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Neon Odyssey"
                      required
                      className="w-full bg-[#1A0E33] border border-pink-500/25 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF4FA3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Artist
                    </label>
                    <input
                      type="text"
                      value={artist}
                      onChange={(e) => setArtist(e.target.value)}
                      className="w-full bg-[#1A0E33] border border-pink-500/25 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Album
                    </label>
                    <input
                      type="text"
                      value={album}
                      onChange={(e) => setAlbum(e.target.value)}
                      className="w-full bg-[#1A0E33] border border-pink-500/25 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Genre
                    </label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full bg-[#1A0E33] border border-pink-500/25 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="Synthwave">Synthwave</option>
                      <option value="Cyberpunk">Cyberpunk</option>
                      <option value="EDM">EDM</option>
                      <option value="Lo-Fi">Lo-Fi</option>
                      <option value="Ambient">Ambient</option>
                      <option value="Pop">Pop</option>
                      <option value="Hip-Hop">Hip-Hop</option>
                      <option value="Electronic">Electronic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Duration (seconds)
                    </label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-[#1A0E33] border border-pink-500/25 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Release Year
                    </label>
                    <input
                      type="number"
                      value={releaseYear}
                      onChange={(e) => setReleaseYear(e.target.value)}
                      className="w-full bg-[#1A0E33] border border-pink-500/25 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Song Description & Liner Notes
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="Describe inspiration, synthesizer gear, or story behind the track..."
                    className="w-full bg-[#1A0E33] border border-pink-500/25 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                {/* Highlights Tags */}
                <div className="flex flex-wrap gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTrending}
                      onChange={(e) => setIsTrending(e.target.checked)}
                      className="accent-[#FF4FA3]"
                    />
                    <span>Mark as Trending</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPopular}
                      onChange={(e) => setIsPopular(e.target.checked)}
                      className="accent-[#FF4FA3]"
                    />
                    <span>Mark as Popular</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRecommended}
                      onChange={(e) => setIsRecommended(e.target.checked)}
                      className="accent-[#FF4FA3]"
                    />
                    <span>Mark as Recommended</span>
                  </label>
                </div>

                {/* Publish Button */}
                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF4FA3] via-pink-400 to-[#7B2CFF] text-white font-bold text-sm tracking-wide shadow-xl shadow-pink-500/30 hover:opacity-95 active:scale-98 transition disabled:opacity-50 glow-pink flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? 'Publishing Track...' : 'Publish to DHANJAY MAHATO Catalog'}</span>
                </button>
              </form>
            )}

            {/* TAB 2: MANAGE SONGS */}
            {activeTab === 'manage' && (
              <div className="space-y-4">
                {editingSong ? (
                  /* Edit form */
                  <form onSubmit={handleUpdateSong} className="p-4 rounded-2xl bg-[#1A0E33] border border-pink-500/40 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <h4 className="font-bold text-sm text-pink-300">Edit Song: {editingSong.title}</h4>
                      <button
                        type="button"
                        onClick={() => setEditingSong(null)}
                        className="text-xs text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-300">Title</label>
                        <input
                          type="text"
                          value={editingSong.title}
                          onChange={(e) => setEditingSong({ ...editingSong, title: e.target.value })}
                          className="w-full bg-[#120824] border border-pink-500/30 rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-300">Artist</label>
                        <input
                          type="text"
                          value={editingSong.artist}
                          onChange={(e) => setEditingSong({ ...editingSong, artist: e.target.value })}
                          className="w-full bg-[#120824] border border-pink-500/30 rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-300">Album</label>
                        <input
                          type="text"
                          value={editingSong.album}
                          onChange={(e) => setEditingSong({ ...editingSong, album: e.target.value })}
                          className="w-full bg-[#120824] border border-pink-500/30 rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-300">Genre</label>
                        <input
                          type="text"
                          value={editingSong.genre}
                          onChange={(e) => setEditingSong({ ...editingSong, genre: e.target.value })}
                          className="w-full bg-[#120824] border border-pink-500/30 rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingSong(null)}
                        className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-[#FF4FA3] text-white text-xs font-bold"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                    {songs.map((song) => (
                      <div
                        key={song.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#1A0E33] border border-white/5 hover:border-pink-500/30 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src={song.coverUrl}
                            alt={song.title}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white truncate">{song.title}</h4>
                            <p className="text-xs text-gray-400 truncate">
                              {song.artist} • {song.genre} • {song.plays} real plays
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingSong(song)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-pink-300 hover:bg-white/5 transition"
                            title="Edit metadata"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSong(song.id, song.title)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5 transition"
                            title="Delete song"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: STORAGE & STATS */}
            {activeTab === 'storage' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-[#1A0E33] border border-pink-500/30">
                    <div className="text-xs text-gray-400">Total Live Catalog</div>
                    <div className="font-display font-black text-2xl text-white mt-1">
                      {songs.length} Tracks
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1A0E33] border border-purple-500/30">
                    <div className="text-xs text-gray-400">Accurate Real Plays</div>
                    <div className="font-display font-black text-2xl text-pink-300 mt-1">
                      {storageStats ? storageStats.totalPlays.toLocaleString() : '...'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1A0E33] border border-teal-500/30">
                    <div className="text-xs text-gray-400">Audio Storage Used</div>
                    <div className="font-display font-black text-2xl text-teal-300 mt-1">
                      {storageStats
                        ? `${(storageStats.storageUsedBytes / (1024 * 1024)).toFixed(1)} MB`
                        : '0 MB'}
                    </div>
                  </div>
                </div>

                {/* Storage Capacity Bar */}
                <div className="p-5 rounded-2xl bg-[#1A0E33] border border-white/10 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-300">Cloud Audio Server Storage Limit</span>
                    <span className="text-pink-300">
                      {storageStats
                        ? `${(storageStats.storageUsedBytes / (1024 * 1024)).toFixed(1)} MB / 500 MB`
                        : '0 / 500 MB'}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[#10091F] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-400 via-pink-500 to-[#7B2CFF]"
                      style={{
                        width: `${Math.min(
                          100,
                          storageStats
                            ? (storageStats.storageUsedBytes / storageStats.storageLimitBytes) * 100
                            : 0
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Persistent database configured at <code className="text-pink-200">/data/database.json</code> and <code className="text-pink-200">/uploads/audio</code>. Uploaded songs remain safely stored across server restarts and deployments!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
