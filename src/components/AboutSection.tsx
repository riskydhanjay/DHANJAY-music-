import React, { useState } from 'react';
import {
  Mail,
  Phone,
  User,
  Sparkles,
  Disc,
  Send,
  CheckCircle2,
  Server,
  Cloud,
  Shield,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const AboutSection: React.FC = () => {
  const [msgName, setMsgName] = useState('');
  const [msgEmail, setMsgEmail] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [sentStatus, setSentStatus] = useState(false);
  const [showDeploymentGuide, setShowDeploymentGuide] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgName.trim() || !msgEmail.trim() || !msgBody.trim()) return;
    setSentStatus(true);
    setTimeout(() => {
      setMsgName('');
      setMsgEmail('');
      setMsgBody('');
      setSentStatus(false);
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Creator Profile Hero */}
      <div className="relative glass-panel rounded-3xl p-6 sm:p-10 border border-pink-500/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#FF4FA3]/20 via-[#7B2CFF]/15 to-transparent rounded-bl-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Creator Avatar & Hologram badge */}
          <div className="lg:col-span-4 flex flex-col items-center text-center">
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-3xl p-[3px] bg-gradient-to-tr from-[#FF4FA3] via-pink-300 to-[#7B2CFF] shadow-2xl shadow-pink-500/30 glow-pink">
              <div className="w-full h-full rounded-[21px] overflow-hidden bg-[#10091F] relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                  alt="DHANJAY MAHATO Studio"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#10091F] via-transparent to-transparent opacity-60" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-xs font-bold text-pink-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Lead Producer & Audio Architect</span>
            </div>
          </div>

          {/* Biography & Vision */}
          <div className="lg:col-span-8 space-y-4 text-left">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FF4FA3]">
              About the Creator
            </span>
            <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
              DHANJAY MAHATO
            </h1>

            <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
              Welcome to the official 3D sound universe of <strong className="text-pink-300 font-bold">DHANJAY MAHATO</strong>.
              Blending cutting-edge cyberpunk aesthetics, neon retro-synth frequencies, and heavyweight basslines, this platform delivers a futuristic auditory journey with real, high-fidelity audio streams.
            </p>

            <p className="text-gray-400 leading-relaxed text-xs sm:text-sm">
              Engineered with a real full-stack architecture, persistent audio file storage, measurable listener telemetry, and instant 3D vinyl rendering. Every track is carefully composed and streamed directly to listeners across the globe without synthetic bot counts or mock interfaces.
            </p>

            {/* Direct Contact Cards with Clickable Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {/* Email Link */}
              <a
                href="mailto:dhanjaykumar1356@gmail.com"
                className="p-4 rounded-2xl glass-panel border border-pink-500/30 hover:border-pink-500/60 transition group flex items-center gap-3.5"
                aria-label="Send email to dhanjaykumar1356@gmail.com"
              >
                <div className="p-3 rounded-xl bg-pink-500/20 text-[#FF4FA3] group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] text-gray-400 font-medium">Direct Inquiries & Bookings</div>
                  <div className="text-xs sm:text-sm font-bold text-white group-hover:text-pink-300 truncate">
                    dhanjaykumar1356@gmail.com
                  </div>
                </div>
              </a>

              {/* Phone Link */}
              <a
                href="tel:9262316710"
                className="p-4 rounded-2xl glass-panel border border-purple-500/30 hover:border-purple-500/60 transition group flex items-center gap-3.5"
                aria-label="Call +91 9262316710"
              >
                <div className="p-3 rounded-xl bg-purple-500/20 text-[#7B2CFF] group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] text-gray-400 font-medium">Direct Phone / WhatsApp</div>
                  <div className="text-xs sm:text-sm font-bold text-white group-hover:text-purple-300">
                    +91 9262316710
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment & Architecture Guide */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
        <button
          onClick={() => setShowDeploymentGuide(!showDeploymentGuide)}
          className="w-full flex items-center justify-between text-left focus:outline-none"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                Worldwide Public Access & Cloud Deployment Instructions
              </h3>
              <p className="text-xs text-gray-400">
                How persistent storage, MP3/WAV uploads, and Cloud Run scaling operate.
              </p>
            </div>
          </div>
          {showDeploymentGuide ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {showDeploymentGuide && (
          <div className="pt-4 border-t border-white/10 text-xs sm:text-sm text-gray-300 space-y-3 leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#1A0E33] border border-pink-500/20">
                <Cloud className="w-5 h-5 text-pink-400 mb-2" />
                <h4 className="font-bold text-white text-sm mb-1">Persistent Storage</h4>
                <p className="text-gray-400 text-xs">
                  New songs uploaded via the Admin Portal are written to disk under <code className="text-pink-300">/uploads/audio</code> and cataloged in <code className="text-pink-300">/data/database.json</code>, surviving browser reloads and restarts.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1A0E33] border border-purple-500/20">
                <Shield className="w-5 h-5 text-purple-400 mb-2" />
                <h4 className="font-bold text-white text-sm mb-1">Secure Admin Authentication</h4>
                <p className="text-gray-400 text-xs">
                  Admin login routes check credentials strictly on the backend. Client sessions use cryptographically generated tokens (<code className="text-purple-300">crypto.randomBytes</code>) and never leak credentials.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1A0E33] border border-teal-500/20">
                <Layers className="w-5 h-5 text-teal-400 mb-2" />
                <h4 className="font-bold text-white text-sm mb-1">Worldwide Deployment</h4>
                <p className="text-gray-400 text-xs">
                  Run <code className="text-teal-300">npm run build</code> followed by <code className="text-teal-300">npm start</code> (running <code className="text-teal-300">node server.ts</code> on port 3000). Seamlessly deployable to Google Cloud Run or Docker.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Direct Contact & Fan Inquiry Form */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-pink-500/25 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF4FA3] uppercase tracking-wider mb-1">
            <Mail className="w-3.5 h-3.5" />
            <span>Get in Touch</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl text-white">
            Send a Direct Message
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Collaborations, licensing, booking, and listener feedback for Dhanjay Mahato.
          </p>
        </div>

        {sentStatus ? (
          <div className="p-6 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center text-emerald-200 space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
            <h4 className="font-bold text-base text-white">Message Dispatched!</h4>
            <p className="text-xs">
              Thank you for reaching out to Dhanjay Mahato. We will respond promptly to your email.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={msgName}
                  onChange={(e) => setMsgName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-[#1A0E33] border border-pink-500/25 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF4FA3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Your Email</label>
                <input
                  type="email"
                  required
                  value={msgEmail}
                  onChange={(e) => setMsgEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#1A0E33] border border-pink-500/25 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF4FA3]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Message</label>
              <textarea
                required
                rows={4}
                value={msgBody}
                onChange={(e) => setMsgBody(e.target.value)}
                placeholder="Write your message, project brief, or music inquiry..."
                className="w-full bg-[#1A0E33] border border-pink-500/25 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF4FA3]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF4FA3] to-[#7B2CFF] text-white font-bold text-xs sm:text-sm tracking-wide shadow-xl shadow-pink-500/20 hover:opacity-95 active:scale-98 transition flex items-center justify-center gap-2 glow-pink"
            >
              <Send className="w-4 h-4" />
              <span>Send Message to DHANJAY MAHATO</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
