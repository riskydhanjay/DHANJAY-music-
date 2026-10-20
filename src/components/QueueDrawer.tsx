import React from 'react';
import { X, Play, Trash2, Music, ListOrdered } from 'lucide-react';
import type { Song } from '../types/music.js';
import { formatTime } from '../utils/audioQueue.js';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  queue: Song[];
  currentSong: Song | null;
  onPlaySong: (song: Song) => void;
  onRemoveFromQueue: (songId: string) => void;
  onClearQueue: () => void;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({
  isOpen,
  onClose,
  queue,
  currentSong,
  onPlaySong,
  onRemoveFromQueue,
  onClearQueue,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end transition-opacity"
      role="dialog"
      aria-label="Play Queue"
      aria-modal="true"
    >
      <div className="w-full max-w-md h-full bg-[#120924] border-l border-pink-500/25 p-6 flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-[#FF4FA3]" />
            <h2 className="font-display font-bold text-lg text-white">Playback Queue</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-300">
              {queue.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {queue.length > 0 && (
              <button
                onClick={onClearQueue}
                className="p-2 text-xs text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition flex items-center gap-1"
                aria-label="Clear queue"
                title="Clear queue"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition"
              aria-label="Close queue"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Songs List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2">
          {queue.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-8">
              <Music className="w-12 h-12 text-pink-500/30 mb-3" />
              <p className="text-sm font-semibold">Your queue is empty</p>
              <p className="text-xs text-gray-500 mt-1">
                Play any song or album to populate your live stream.
              </p>
            </div>
          ) : (
            queue.map((song, index) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <div
                  key={`${song.id}-${index}`}
                  className={`group flex items-center justify-between p-3 rounded-xl transition ${
                    isCurrent
                      ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/40 text-white'
                      : 'hover:bg-white/5 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-5 text-center text-xs font-semibold text-gray-500 group-hover:text-pink-300">
                      {index + 1}
                    </span>

                    <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-black">
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => onPlaySong(song)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                        aria-label={`Play ${song.title}`}
                      >
                        <Play className="w-4 h-4 fill-white" />
                      </button>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-sm font-semibold truncate ${
                          isCurrent ? 'text-[#FF4FA3]' : 'text-white'
                        }`}
                      >
                        {song.title}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {song.artist} • {formatTime(song.duration)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveFromQueue(song.id)}
                    className="p-1.5 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                    aria-label={`Remove ${song.title} from queue`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
