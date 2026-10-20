import React, { useState } from 'react';
import { X, Copy, Check, Share2, Send, ExternalLink } from 'lucide-react';
import type { Song } from '../types/music.js';

interface ShareModalProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ song, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !song) return null;

  const shareUrl = `${window.location.origin}${window.location.pathname}?song=${song.id}`;
  const shareText = `Listen to "${song.title}" by ${song.artist} on DHANJAY MAHATO 3D Music Stream!`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Clipboard copy error:', err);
    }
  };

  const shareWhatsApp = () => {
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      '_blank'
    );
  };

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank'
    );
  };

  const shareTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      '_blank'
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Share song dialog"
    >
      <div className="w-full max-w-md glass-panel rounded-2xl p-6 border border-pink-500/30 bg-[#120924]/95 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#FF4FA3]" />
            <h3 className="font-display font-bold text-lg text-white">Share Music</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition"
            aria-label="Close share dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Song Mini Preview */}
        <div className="flex items-center gap-3.5 my-5 p-3 rounded-xl bg-white/5 border border-white/5">
          <img
            src={song.coverUrl}
            alt={song.title}
            className="w-14 h-14 rounded-xl object-cover shadow-sm"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-display font-bold text-sm text-white truncate text-glow-pink">
              {song.title}
            </h4>
            <p className="text-xs text-pink-300 truncate mt-0.5">{song.artist}</p>
            <span className="inline-block mt-1 text-[10px] uppercase font-bold text-purple-300">
              {song.genre} • {song.plays} Plays
            </span>
          </div>
        </div>

        {/* Copy Link Input */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Shareable Track Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full bg-[#1A0E33] border border-pink-500/25 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF4FA3] to-[#7B2CFF] text-white text-xs font-bold flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition flex-shrink-0"
              aria-label="Copy share link"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Social Share Buttons */}
        <div>
          <span className="block text-xs font-semibold text-gray-300 mb-2">
            Share via Social Channels
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={shareWhatsApp}
              className="py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <Send className="w-3.5 h-3.5" />
              WhatsApp
            </button>

            <button
              onClick={shareTwitter}
              className="py-2.5 px-3 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Twitter / X
            </button>

            <button
              onClick={shareTelegram}
              className="py-2.5 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <Send className="w-3.5 h-3.5" />
              Telegram
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
