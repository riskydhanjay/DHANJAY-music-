import React, { useState } from 'react';
import { ListMusic, Plus, Play, Trash2, Music, Sparkles } from 'lucide-react';
import type { Song, Playlist } from '../types/music.js';
import { SongCard } from './SongCard.js';

interface PlaylistsViewProps {
  playlists: Playlist[];
  allSongs: Song[];
  onCreatePlaylist: (name: string, description: string) => void;
  onDeletePlaylist: (playlistId: string) => void;
  onPlaySong: (song: Song) => void;
  onPlayEntirePlaylist: (playlist: Playlist) => void;
  currentSong: Song | null;
  isPlaying: boolean;
  favorites: string[];
  onToggleFavorite: (songId: string) => void;
  onShare: (song: Song) => void;
  onAddToPlaylist: (playlistId: string, songId: string) => void;
}

export const PlaylistsView: React.FC<PlaylistsViewProps> = ({
  playlists,
  allSongs,
  onCreatePlaylist,
  onDeletePlaylist,
  onPlaySong,
  onPlayEntirePlaylist,
  currentSong,
  isPlaying,
  favorites,
  onToggleFavorite,
  onShare,
  onAddToPlaylist,
}) => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    playlists[0]?.id || null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const activePlaylist = playlists.find((p) => p.id === selectedPlaylistId) || playlists[0];
  const playlistSongs = activePlaylist
    ? activePlaylist.songIds
        .map((id) => allSongs.find((s) => s.id === id))
        .filter((s): s is Song => Boolean(s))
    : [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreatePlaylist(newName.trim(), newDesc.trim());
    setNewName('');
    setNewDesc('');
    setIsCreating(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF4FA3] uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Sound Collections</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            Playlists
          </h1>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF4FA3] to-[#7B2CFF] text-white text-xs sm:text-sm font-bold flex items-center gap-2 hover:opacity-95 active:scale-95 transition shadow-lg shadow-pink-500/20 glow-pink"
        >
          <Plus className="w-4 h-4" />
          <span>Create Playlist</span>
        </button>
      </div>

      {/* Create Playlist Modal / Form */}
      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="glass-panel rounded-2xl p-6 mb-8 border border-pink-500/30 max-w-xl mx-auto space-y-4"
        >
          <h3 className="font-display font-bold text-lg text-white">Create New Playlist</h3>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Playlist Name</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Midnight Cyber Synth"
              className="w-full bg-[#1A0E33] border border-pink-500/25 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF4FA3]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Describe your playlist mood..."
              className="w-full bg-[#1A0E33] border border-pink-500/25 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF4FA3]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#FF4FA3] text-white font-bold text-xs"
            >
              Save Playlist
            </button>
          </div>
        </form>
      )}

      {/* Playlist Grid & Active Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Playlists Selector List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
            Your Playlists ({playlists.length})
          </h3>
          {playlists.map((pl) => {
            const isSelected = activePlaylist?.id === pl.id;
            return (
              <div
                key={pl.id}
                onClick={() => setSelectedPlaylistId(pl.id)}
                className={`cursor-pointer p-3.5 rounded-2xl glass-panel border transition flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-pink-500/60 bg-gradient-to-r from-pink-500/15 to-purple-500/15 shadow-md shadow-pink-500/10'
                    : 'border-white/5 hover:border-pink-500/30'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-black flex-shrink-0">
                    <img
                      src={pl.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80'}
                      alt={pl.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-display font-bold text-sm text-white truncate">{pl.name}</h4>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {pl.songIds.length} tracks
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete playlist "${pl.name}"?`)) {
                      onDeletePlaylist(pl.id);
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition"
                  title="Delete playlist"
                  aria-label={`Delete ${pl.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Selected Playlist Content */}
        <div className="lg:col-span-8">
          {activePlaylist ? (
            <div className="space-y-6">
              {/* Banner */}
              <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-pink-500/25 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <img
                  src={activePlaylist.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'}
                  alt={activePlaylist.name}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover shadow-2xl flex-shrink-0"
                />

                <div className="flex-1 text-center sm:text-left">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF4FA3]">
                    Playlist Collection
                  </span>
                  <h2 className="font-display font-black text-2xl sm:text-3xl text-white mt-1">
                    {activePlaylist.name}
                  </h2>
                  <p className="text-sm text-gray-300 mt-2">
                    {activePlaylist.description || 'Custom playlist on DHANJAY MAHATO 3D Stream.'}
                  </p>
                  <div className="text-xs text-pink-300 mt-2">
                    {playlistSongs.length} Songs in collection
                  </div>

                  {playlistSongs.length > 0 && (
                    <button
                      onClick={() => onPlayEntirePlaylist(activePlaylist)}
                      className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF4FA3] to-[#7B2CFF] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-pink-500/20 hover:scale-105 active:scale-95 transition glow-pink"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Play Entire Playlist</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Playlist Tracks */}
              {playlistSongs.length === 0 ? (
                <div className="p-12 text-center text-gray-400 glass-panel rounded-2xl">
                  <Music className="w-12 h-12 mx-auto text-pink-500/30 mb-3" />
                  <p className="font-semibold text-white">This playlist has no songs yet</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Browse songs and click the "+" icon to add tracks here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {playlistSongs.map((song) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      isCurrentSong={currentSong?.id === song.id}
                      isPlaying={isPlaying}
                      isFavorite={favorites.includes(song.id)}
                      onPlay={onPlaySong}
                      onToggleFavorite={onToggleFavorite}
                      onShare={onShare}
                      playlists={playlists}
                      onAddToPlaylist={onAddToPlaylist}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400 glass-panel rounded-2xl">
              <p>Select or create a playlist to view tracks.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
