import React, { useState } from 'react';
import {
  Disc,
  Search,
  Heart,
  ListMusic,
  Compass,
  Sparkles,
  User,
  ShieldCheck,
  Menu,
  X,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  favoritesCount: number;
  playlistsCount: number;
  queueCount: number;
  onToggleQueue: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  favoritesCount,
  playlistsCount,
  queueCount,
  onToggleQueue,
  onOpenAdmin,
  isAdminLoggedIn,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home', icon: Sparkles },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'all-songs', label: 'All Songs', icon: Disc },
    { id: 'playlists', label: 'Playlists', icon: ListMusic, badge: playlistsCount },
    { id: 'favorites', label: 'Favorites', icon: Heart, badge: favoritesCount },
    { id: 'about', label: 'About', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-pink-500/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo Brand */}
          <button
            onClick={() => {
              onSelectTab('home');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 group text-left transition focus:outline-none"
            aria-label="DHANJAY MAHATO Home"
          >
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-tr from-[#FF4FA3] via-[#7B2CFF] to-[#10091F] p-[2px] shadow-lg group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#10091F] rounded-[10px] flex items-center justify-center relative overflow-hidden">
                <Disc className="w-6 h-6 text-[#FF4FA3] animate-vinyl-spin" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF4FA3]/20 to-transparent pointer-events-none" />
              </div>
            </div>
            <div>
              <div className="font-display font-extrabold text-lg sm:text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-200 to-[#FF4FA3] group-hover:to-[#7B2CFF] transition-all">
                DHANJAY MAHATO
              </div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-pink-400">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF4FA3] animate-ping" />
                3D Music Stream
              </div>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onSelectTab(link.id)}
                  className={`relative px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-[#FF4FA3]/25 to-[#7B2CFF]/25 border border-[#FF4FA3]/40 shadow-sm shadow-pink-500/20'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF4FA3]' : 'text-gray-400'}`} />
                  <span>{link.label}</span>
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#FF4FA3]/30 text-pink-200 border border-[#FF4FA3]/40">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-xs relative">
            <Search className="w-4 h-4 absolute left-3.5 text-pink-300 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search songs, artists, albums..."
              aria-label="Search music catalog"
              className="w-full bg-[#1B1133]/80 border border-pink-500/25 rounded-xl pl-9.5 pr-8 py-2 text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#FF4FA3] focus:ring-1 focus:ring-[#FF4FA3] transition shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 text-gray-400 hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Buttons: Queue & Admin Portal */}
          <div className="flex items-center gap-2.5">
            {/* Queue Toggle */}
            <button
              onClick={onToggleQueue}
              className="relative p-2.5 rounded-xl glass-panel text-gray-300 hover:text-white hover:border-[#FF4FA3]/40 transition"
              aria-label={`Current audio queue (${queueCount} items)`}
              title="Queue"
            >
              <Radio className="w-4 h-4 text-purple-300" />
              {queueCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF4FA3] text-[10px] font-extrabold flex items-center justify-center text-white shadow-sm">
                  {queueCount}
                </span>
              )}
            </button>

            {/* Admin Portal Button */}
            <button
              onClick={onOpenAdmin}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                isAdminLoggedIn
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-[#FF4FA3] to-[#7B2CFF] text-white hover:opacity-95 shadow-md shadow-purple-600/30'
              }`}
              aria-label={isAdminLoggedIn ? 'Admin Panel (Logged In)' : 'Admin Owner Login'}
            >
              {isAdminLoggedIn ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-200" />
                  <span className="hidden sm:inline">Owner Active</span>
                </>
              ) : (
                <>
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin Portal</span>
                </>
              )}
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl glass-panel text-gray-300 hover:text-white hover:border-pink-500/40"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-pink-300 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search songs, artists..."
              className="w-full bg-[#1B1133] border border-pink-500/25 rounded-xl pl-9.5 pr-8 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#FF4FA3]"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                aria-label="Clear mobile search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-pink-500/20 space-y-1" aria-label="Mobile Navigation">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    onSelectTab(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'text-white bg-[#FF4FA3]/20 border border-[#FF4FA3]/30'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF4FA3]' : 'text-gray-400'}`} />
                    <span>{link.label}</span>
                  </div>
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#FF4FA3]/30 text-pink-200">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
};
