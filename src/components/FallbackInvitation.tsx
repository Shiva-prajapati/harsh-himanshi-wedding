import React, { useState } from 'react';
import { Sparkles, MapPin, Phone, Heart, Calendar, Clock, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';
import { WEDDING_DATA } from '../data/weddingData';
import { royalAudio } from '../utils/audio';

interface FallbackInvitationProps {
  onToggle3D?: () => void;
  hasWebGL?: boolean;
}

export const FallbackInvitation: React.FC<FallbackInvitationProps> = ({
  onToggle3D,
  hasWebGL = true,
}) => {
  const [blessingMessage, setBlessingMessage] = useState<string>('');
  const [blessingSubmitted, setBlessingSubmitted] = useState<boolean>(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  const toggleAudio = () => {
    const playing = royalAudio.toggle();
    setIsAudioPlaying(playing);
  };

  const handleSendBlessings = (e: React.FormEvent) => {
    e.preventDefault();
    royalAudio.playChime(1174.66);

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#FFDF73', '#C9A84C', '#E8A0A0', '#FFF8F0', '#6B1A2C'],
      });
    } catch {
      // Confetti fallback
    }

    setBlessingSubmitted(true);
    setTimeout(() => {
      setBlessingSubmitted(false);
      setBlessingMessage('');
    }, 4000);
  };

  return (
    <div className="w-full min-h-screen bg-[#0D1B2A] text-[#FFF8F0] overflow-y-auto overflow-x-hidden p-4 sm:p-8 flex flex-col items-center">
      {/* Top Floating Controls */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-6 z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-amber-500/40">
          <span className="text-amber-400">🪷</span>
          <span
            className="text-xs sm:text-sm font-semibold text-amber-200 tracking-wider"
            style={{ fontFamily: 'var(--font-royal)' }}
          >
            Harsh &amp; Himanshi
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasWebGL && onToggle3D && (
            <button
              onClick={onToggle3D}
              className="px-4 py-1.5 rounded-full glass-panel text-xs font-semibold text-amber-300 hover:text-white border border-amber-500/40 flex items-center gap-1.5 transition-all shadow-md"
            >
              <Sparkles size={14} className="text-amber-400" />
              <span>Launch 3D Experience</span>
            </button>
          )}

          <button
            onClick={toggleAudio}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full glass-panel text-amber-200 border border-amber-500/40 flex items-center gap-1.5 transition-all"
            title="Toggle Wedding Music"
          >
            {isAudioPlaying ? (
              <Volume2 size={16} className="text-amber-300" />
            ) : (
              <VolumeX size={16} className="text-amber-400/80" />
            )}
            <span className="hidden sm:inline text-xs font-sans">
              {isAudioPlaying ? 'Playing' : 'Music'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Royal Card Frame */}
      <main
        className="w-full max-w-3xl rounded-3xl p-6 sm:p-12 shadow-2xl relative border-2 border-amber-400/80 my-4"
        style={{
          background: 'linear-gradient(145deg, #1A050B 0%, #300610 35%, #0D1B2A 100%)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8), inset 0 0 40px rgba(201, 168, 76, 0.2)',
        }}
      >
        {/* Ornate Corner Accents */}
        <div className="absolute top-3 left-3 text-amber-400 text-xl">❖</div>
        <div className="absolute top-3 right-3 text-amber-400 text-xl">❖</div>
        <div className="absolute bottom-3 left-3 text-amber-400 text-xl">❖</div>
        <div className="absolute bottom-3 right-3 text-amber-400 text-xl">❖</div>

        {/* 1. Auspicious Shloka & Ganesha */}
        <section className="text-center mb-8">
          <p
            className="text-base sm:text-lg font-bold tracking-widest text-amber-300 mb-2"
            style={{ fontFamily: 'var(--font-hindi)' }}
          >
            {WEDDING_DATA.ganeshaMantra}
          </p>
          <p
            className="text-xs sm:text-sm text-amber-200/90 leading-relaxed italic max-w-xl mx-auto"
            style={{ fontFamily: 'var(--font-hindi)' }}
          >
            {WEDDING_DATA.shlokaSanskrit}
          </p>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto my-4" />
        </section>

        {/* 2. Opening Card Quote */}
        <section className="text-center mb-8 px-4">
          <p
            className="text-sm sm:text-base text-rose-200 italic leading-relaxed font-serif max-w-lg mx-auto"
            style={{ fontFamily: 'var(--font-script)' }}
          >
            &ldquo;{WEDDING_DATA.invitationQuote}&rdquo;
          </p>
          <p className="text-xs tracking-widest uppercase text-amber-300/80 font-sans mt-3">
            With immense joy, we cordially invite you to celebrate the royal wedding of
          </p>
        </section>

        {/* 3. Couple & Lineage Section */}
        <section className="my-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Groom Box */}
            <div className="glass-panel rounded-2xl p-6 text-center border border-amber-500/40 relative">
              <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold block mb-1">
                Groom
              </span>
              <h2
                className="text-2xl sm:text-3xl font-bold text-amber-200 gold-shimmer mb-3"
                style={{ fontFamily: 'var(--font-royal)' }}
              >
                {WEDDING_DATA.groom.name}
              </h2>
              <div className="text-xs sm:text-sm text-cream space-y-2">
                <p>
                  <span className="text-amber-300/80 text-[11px] uppercase tracking-wider block font-sans">
                    Son of
                  </span>
                  <strong className="text-amber-100 font-medium">
                    {WEDDING_DATA.groom.parents}
                  </strong>
                </p>
                <p>
                  <span className="text-amber-300/80 text-[11px] uppercase tracking-wider block font-sans">
                    Grandson of
                  </span>
                  <span className="text-amber-200/90">
                    {WEDDING_DATA.groom.grandparents}
                  </span>
                </p>
                {WEDDING_DATA.groom.residence && (
                  <p className="text-[11px] text-amber-200/70 italic pt-1">
                    {WEDDING_DATA.groom.residence}
                  </p>
                )}
              </div>
            </div>

            {/* Bride Box */}
            <div className="glass-panel rounded-2xl p-6 text-center border border-amber-500/40 relative">
              <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold block mb-1">
                Bride
              </span>
              <h2
                className="text-2xl sm:text-3xl font-bold text-amber-200 gold-shimmer mb-3"
                style={{ fontFamily: 'var(--font-royal)' }}
              >
                {WEDDING_DATA.bride.name}
              </h2>
              <div className="text-xs sm:text-sm text-cream space-y-2">
                <p>
                  <span className="text-amber-300/80 text-[11px] uppercase tracking-wider block font-sans">
                    Daughter of
                  </span>
                  <strong className="text-amber-100 font-medium">
                    {WEDDING_DATA.bride.parents}
                  </strong>
                </p>
                <p>
                  <span className="text-amber-300/80 text-[11px] uppercase tracking-wider block font-sans">
                    Residence
                  </span>
                  <span className="text-amber-200/90">
                    {WEDDING_DATA.bride.residence}
                  </span>
                </p>
                <p className="text-[11px] text-amber-200/70 italic pt-1">
                  With eternal love &amp; family blessings
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Programme Timeline */}
        <section className="my-10">
          <div className="text-center mb-6">
            <span className="text-amber-300 text-xs tracking-widest uppercase font-semibold">
              ✦ Programme of Auspicious Ceremonies ✦
            </span>
            <h3
              className="text-xl sm:text-2xl font-bold text-amber-200 gold-shimmer mt-1"
              style={{ fontFamily: 'var(--font-royal)' }}
            >
              Wedding Itinerary
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WEDDING_DATA.events.map((evt, idx) => (
              <div
                key={evt.id}
                className="glass-panel rounded-xl p-5 border border-amber-500/30 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{evt.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300">
                      Day {idx + 1}
                    </span>
                  </div>
                  <h4
                    className="text-base font-bold text-amber-200"
                    style={{ fontFamily: 'var(--font-royal)' }}
                  >
                    {evt.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-amber-300/80 mt-1">
                    <Calendar size={13} className="text-amber-400 shrink-0" />
                    <span>{evt.day}, {evt.date}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-500/20 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-100">
                    <Clock size={13} className="text-amber-400" />
                    <span className="font-medium">{evt.time}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-amber-200/80">
                    <MapPin size={13} className="text-amber-400 shrink-0 mt-0.5" />
                    <span>{evt.venue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Venue & Barat Route */}
        <section className="my-8 glass-panel rounded-2xl p-6 text-center border border-amber-500/40">
          <span className="text-[11px] uppercase tracking-widest text-amber-400 font-bold block mb-1">
            Wedding Reception Venue
          </span>
          <h3
            className="text-xl sm:text-2xl font-bold text-amber-200 gold-shimmer"
            style={{ fontFamily: 'var(--font-royal)' }}
          >
            {WEDDING_DATA.venue.name}
          </h3>
          <p className="text-xs sm:text-sm text-amber-100 mt-1">
            {WEDDING_DATA.venue.fullAddress}
          </p>

          <div className="my-2 p-2 rounded-lg bg-black/40 border border-amber-500/20 text-xs text-rose-200 space-y-1">
            <p>🏡 <strong className="text-amber-200">Thursday, 19 Nov 2026:</strong> Mandha &amp; rituals at home in Sadholi Kadeem</p>
            <p>💍 <strong className="text-amber-200">Friday, 20 Nov 2026:</strong> Barat departs at 5:00 PM from {WEDDING_DATA.departureInfo.origin} to Shiva Banquet Hall</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
            <a
              href={WEDDING_DATA.venue.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="royal-btn px-5 py-2 rounded-full text-xs font-semibold tracking-wider flex items-center gap-2 text-amber-100 no-underline shadow-lg"
            >
              <MapPin size={14} />
              <span>Open in Google Maps</span>
            </a>

            <a
              href={`https://wa.me/91${WEDDING_DATA.rsvp.primaryContact.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(
                `Namaste! I would like to RSVP for Harsh & Himanshi's wedding.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="royal-btn px-5 py-2 rounded-full text-xs font-semibold tracking-wider flex items-center gap-2 text-amber-100 no-underline shadow-lg"
            >
              <Phone size={14} />
              <span>Confirm via WhatsApp ({WEDDING_DATA.rsvp.primaryContact.phone})</span>
            </a>
          </div>
        </section>

        {/* 6. Send Blessings Form */}
        <section className="my-8 glass-panel rounded-2xl p-6 border border-amber-500/40">
          {blessingSubmitted ? (
            <div className="text-center py-4 text-amber-200">
              <Heart className="mx-auto text-rose-400 mb-2 fill-rose-400" size={32} />
              <h4 className="text-base font-bold">Thank You For Your Blessings!</h4>
              <p className="text-xs text-rose-200 mt-1">
                Your wishes have been received with deep love and gratitude.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendBlessings} className="flex flex-col gap-3">
              <h4
                className="text-sm uppercase tracking-wider text-amber-300 font-semibold text-center"
                style={{ fontFamily: 'var(--font-royal)' }}
              >
                Send Warm Wishes &amp; Blessings
              </h4>
              <textarea
                rows={2}
                value={blessingMessage}
                onChange={(e) => setBlessingMessage(e.target.value)}
                placeholder="Write your wishes for Harsh & Himanshi..."
                className="w-full p-3 rounded-lg bg-black/60 border border-amber-500/40 text-amber-100 placeholder-amber-200/50 text-xs focus:outline-none focus:border-amber-300"
                required
              />
              <button
                type="submit"
                className="royal-btn py-2 px-6 rounded-lg text-xs font-semibold tracking-wider mx-auto"
              >
                Send Blessings 🌸
              </button>
            </form>
          )}
        </section>

        {/* 7. RSVP & WKCS Contacts */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="glass-panel rounded-xl p-4 border border-amber-500/30">
            <h5 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
              R. S. V. P.
            </h5>
            <div className="text-xs text-amber-100/90 space-y-1">
              {WEDDING_DATA.rsvp.allContacts.map((c, i) => (
                <div key={i} className="flex justify-between items-center py-0.5 border-b border-amber-500/10">
                  <span>{c.name}</span>
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="text-amber-300 text-[11px]">
                      {c.phone}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4 border border-amber-500/30">
            <h5 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
              W. K. C. S. (With Best Compliments)
            </h5>
            <div className="text-xs text-amber-100/90 flex flex-wrap gap-1.5">
              {WEDDING_DATA.wkcs.map((item, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/20 text-[11px]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center mt-10 text-xs text-amber-200/60">
          <p>© 2026 Prajapati Family • Royal Wedding Celebration</p>
        </footer>
      </main>
    </div>
  );
};
