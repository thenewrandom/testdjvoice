import React, { useRef, useState } from 'react';
import { 
  Settings, Music, Folder, Mic2, Sliders, Check, FileText, 
  Loader, Sparkles, Zap, Coffee, Mic, Disc, Cpu, Volume2,
  Database, Plus, Link as LinkIcon, X, HelpCircle, ShieldAlert
} from 'lucide-react';
import { PartyConfig, MusicSource, Track } from '../types';
import { PERSONAS } from '../data/personas';
import { soundFx } from '../utils/audioEffects';
import { generateVoice } from '../services/aiService';

interface DashboardViewProps {
  config: PartyConfig;
  setConfig: React.Dispatch<React.SetStateAction<PartyConfig>>;
  onGenerate: () => void;
  isLoading: boolean;
  onAddCustomTrack: (track: Track) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string; size?: number }>> = {
  Zap: Zap,
  Coffee: Coffee,
  Mic: Mic,
  Disc: Disc,
  Cpu: Cpu,
  Music: Music
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  config,
  setConfig,
  onGenerate,
  isLoading,
  onAddCustomTrack
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customArtist, setCustomArtist] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customBpm, setCustomBpm] = useState('125');
  const [authNotification, setAuthNotification] = useState<string | null>(null);

  const toggleSource = (src: MusicSource) => {
    setConfig(prev => ({
      ...prev,
      sources: prev.sources.includes(src) 
        ? prev.sources.filter(s => s !== src) 
        : [...prev.sources, src]
    }));
  };

  const handleSourceClick = (src: MusicSource) => {
    soundFx.playLaser();
    if (config.sources.includes(src)) {
      toggleSource(src);
      return;
    }

    if (src === 'Spotify' || src === 'Apple Music' || src === 'iTunes') {
      setAuthNotification(`Connecting to ${src} API... Handshake established!`);
      setTimeout(() => {
        toggleSource(src);
        setAuthNotification(null);
      }, 1200);
    } else if (src === 'Local Drive') {
      setShowAddModal(true);
      toggleSource(src);
    } else {
      toggleSource(src);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (!config.sources.includes('Local Drive')) {
        toggleSource('Local Drive');
      }
      Array.from(e.target.files).forEach((file: File, idx: number) => {
        const url = URL.createObjectURL(file);
        onAddCustomTrack({
          id: `local-${Date.now()}-${idx}`,
          title: file.name.replace(/\.[^/.]+$/, ""),
          artist: "Local Upload",
          albumCover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80",
          audioUrl: url,
          bpm: 124,
          key: "8A",
          energy: 7,
          genre: "Local File",
          tags: ["local", "custom"]
        });
      });
      setAuthNotification("Local audio files added to crate pool!");
      setTimeout(() => setAuthNotification(null), 3000);
    }
  };

  const handleAddCustomTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customUrl) return;

    soundFx.playRewind();
    onAddCustomTrack({
      id: `custom-${Date.now()}`,
      title: customTitle,
      artist: customArtist || "Unknown Artist",
      albumCover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80",
      audioUrl: customUrl,
      bpm: parseInt(customBpm) || 125,
      key: "8B",
      energy: 8,
      genre: "Custom Track",
      tags: ["custom", "added"]
    });

    setCustomTitle('');
    setCustomArtist('');
    setCustomUrl('');
    setShowAddModal(false);
    setAuthNotification(`Added "${customTitle}" to the crate!`);
    setTimeout(() => setAuthNotification(null), 3000);
  };

  const toggleTransition = (fx: string) => {
    setConfig(prev => ({
      ...prev,
      transitions: prev.transitions.includes(fx) 
        ? prev.transitions.filter(f => f !== fx) 
        : [...prev.transitions, fx]
    }));
  };

  const previewVoice = (e: React.MouseEvent, personaId: string) => {
    e.stopPropagation();
    const p = PERSONAS.find(x => x.id === personaId);
    if (!p) return;

    const previewText = `Yo! This is DJ ${p.name}. Let's turn up the ${p.mood} vibes!`;
    generateVoice(previewText, p).then(audio => {
      if (audio) { audio.play().catch(() => {}); return; }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(previewText);
        utterance.pitch = p.pitch;
        utterance.rate = p.rate;
        window.speechSynthesis.speak(utterance);
      } else soundFx.playHypeSiren();
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-20 text-slate-100 animate-fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-cyan-200 to-emerald-400 uppercase">
              Set Up Your Party
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Configure your AI DJ persona, connect your audio crates, and customize the mixing behavior.
          </p>
        </div>

        {authNotification && (
          <div className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-xs font-bold flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4" />
            <span>{authNotification}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Crate Sources & Persona */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Connect Sources Deck */}
          <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-emerald-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2.5">
                <Music className="w-5 h-5 text-cyan-400" />
                <span>Connect Music Crates</span>
              </h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400/50 transition-all uppercase tracking-wider"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom URL / Upload</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Select one or more crates to populate your party playlist. The <strong className="text-slate-100">Sound Benders Vault</strong> contains exclusive royalty-free master tracks ready for seamless mixing.
            </p>

            <div className="flex flex-wrap gap-2.5">
              {(['Sound Benders Vault', 'Spotify', 'Apple Music', 'iTunes', 'Local Drive'] as MusicSource[]).map(src => {
                const isConnected = config.sources.includes(src);
                return (
                  <button
                    key={src}
                    onClick={() => handleSourceClick(src)}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2.5 uppercase ${
                      isConnected
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 border-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-cyan-500/50 hover:text-slate-100'
                    }`}
                  >
                    {src === 'Sound Benders Vault' && <Database className="w-4 h-4 text-amber-400" />}
                    {src === 'Local Drive' && <Folder className="w-4 h-4 text-emerald-400" />}
                    {(src === 'Spotify' || src === 'Apple Music' || src === 'iTunes') && <Music className="w-4 h-4 text-pink-400" />}
                    <span>{src}</span>
                    {isConnected && <Check className="w-3.5 h-3.5 text-slate-950 font-black ml-1" />}
                  </button>
                );
              })}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="audio/*"
              className="hidden"
            />
          </div>

          {/* 2. AI DJ Persona Selector */}
          <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-cyan-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2.5">
                <Mic2 className="w-5 h-5 text-cyan-400" />
                <span>Select AI DJ Persona</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">PITCH & RATE BALANCED</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {PERSONAS.map(p => {
                const isSelected = config.persona === p.id;
                const IconComponent = ICON_MAP[p.iconName] || Music;
                
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      soundFx.playLaser();
                      setConfig({ ...config, persona: p.id });
                    }}
                    className={`p-4 rounded-2xl cursor-pointer border transition-all flex flex-col items-center text-center relative group overflow-hidden ${
                      isSelected
                        ? `bg-slate-800/90 ${p.borderClass} shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/30`
                        : 'bg-slate-950/40 border-slate-800 hover:border-cyan-500/30 hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Top Right Preview Voice Button */}
                    <button
                      onClick={(e) => previewVoice(e, p.id)}
                      title="Test Voice Sample"
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950/60 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>

                    <div className={`p-3 rounded-2xl mb-2.5 transition-transform group-hover:scale-110 ${
                      isSelected ? p.bgClass + ' ' + p.accentClass : 'bg-slate-800/80 text-slate-400'
                    }`}>
                      <IconComponent size={22} />
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-100 mb-0.5">{p.name}</h4>
                    <span className="text-[11px] font-medium text-slate-400 line-clamp-1 mb-1">{p.genre}</span>
                    <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-cyan-400/20 text-cyan-300 font-bold' : 'bg-slate-900 text-slate-500'
                    }`}>
                      {p.mood}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Selected Persona Bio */}
            {(() => {
              const active = PERSONAS.find(p => p.id === config.persona);
              if (!active) return null;
              return (
                <div className="mt-4 p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-100 font-bold">{active.name}:</strong> {active.bio}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* 3. Mixing & Behavior Controls */}
          <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-fuchsia-500/30 shadow-xl">
            <h3 className="text-lg font-bold mb-5 flex items-center gap-2.5">
              <Sliders className="w-5 h-5 text-fuchsia-400" />
              <span>Mixing & Hosting Behavior</span>
            </h3>

            {/* Chattiness Slider */}
            <div className="mb-6 p-4 rounded-xl bg-slate-950/40 border border-slate-800">
              <div className="flex text-xs font-bold text-slate-300 mb-2 justify-between items-center">
                <span>DJ Chattiness & Banter Frequency</span>
                <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-mono text-sm border border-cyan-500/30">
                  {config.interactionLevel} / 10
                </span>
              </div>
              
              <input
                type="range"
                min="1"
                max="10"
                value={config.interactionLevel}
                onChange={(e) => setConfig({ ...config, interactionLevel: parseInt(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              
              <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-2">
                <span>1: Strictly Music</span>
                <span>5: Balanced Host</span>
                <span>10: Non-Stop Hypeman</span>
              </div>
            </div>

            {/* Transition FX Checkboxes */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Active Transition Effects
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {['Pitch/Tempo Sync', 'Scratching', 'EQ Blending', 'Laser Sweeps'].map(fx => {
                  const checked = config.transitions.includes(fx);
                  return (
                    <label
                      key={fx}
                      onClick={() => toggleTransition(fx)}
                      className={`flex items-center gap-2.5 cursor-pointer p-3 rounded-xl border text-xs font-semibold transition-all ${
                        checked
                          ? 'bg-cyan-500/20 border-cyan-400 text-slate-100 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                        checked ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-black' : 'border-slate-700 bg-slate-950'
                      }`}>
                        {checked && <Check className="w-3 h-3" />}
                      </div>
                      <span className="truncate">{fx}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Advanced Toggle Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              
              {/* Auto Ducking */}
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 cursor-pointer hover:border-cyan-500/30 transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-100 mb-0.5">Auto-Duck Track Volume</div>
                  <div className="text-[11px] text-slate-400">Lower music volume to 30% when DJ speaks</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoDucking}
                  onChange={(e) => setConfig({ ...config, autoDucking: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                />
              </label>

              {/* Gemini AI Banter */}
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 cursor-pointer hover:border-cyan-500/30 transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-100 mb-0.5 flex items-center gap-1.5">
                    <span>Gemini AI Speech Mode</span>
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                  </div>
                  <div className="text-[11px] text-slate-400">Use live LLM prompts for banter (or instant fallback)</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.useGeminiAi}
                  onChange={(e) => setConfig({ ...config, useGeminiAi: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                />
              </label>

            </div>
          </div>
        </div>

        {/* Right Column - Party Details & Launch */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-emerald-500/30 shadow-xl">
            <h3 className="text-lg font-bold mb-5 flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-emerald-400" />
              <span>Party Vibe & Details</span>
            </h3>

            <div className="space-y-4">
              
              {/* Event Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Type of Event
                </label>
                <input
                  type="text"
                  placeholder="e.g. Birthday Bash, Pool Party, NYE Celebration..."
                  value={config.partyType}
                  onChange={(e) => setConfig({ ...config, partyType: e.target.value })}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all placeholder:text-slate-600"
                />
                {/* Quick suggestions */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['Birthday Bash', 'Pool Party', 'Weekend Chill', 'Rooftop Sunset', 'Late Night Gym'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setConfig({ ...config, partyType: tag })}
                      className="text-[10px] px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 font-medium transition-colors"
                    >
                      +{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shoutouts */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Guest of Honor / VIP Shoutouts
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah's 30th, The Marketing Team, Alex..."
                  value={config.guestOfHonor}
                  onChange={(e) => setConfig({ ...config, guestOfHonor: e.target.value })}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all placeholder:text-slate-600"
                />
              </div>

              {/* Musical Vibe */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Target Musical Vibe
                </label>
                <input
                  type="text"
                  placeholder="e.g. Unstoppable Energy, Nostalgic & Funky..."
                  value={config.mood}
                  onChange={(e) => setConfig({ ...config, mood: e.target.value })}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all placeholder:text-slate-600"
                />
              </div>

              {/* Setlist Size */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Setlist Size (Track Count)
                </label>
                <select
                  value={config.duration}
                  onChange={(e) => setConfig({ ...config, duration: e.target.value })}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 focus:border-cyan-400 outline-none transition-all cursor-pointer"
                >
                  <option value="3">Mini Demo (3 tracks)</option>
                  <option value="5">Short Set (5 tracks)</option>
                  <option value="10">Standard Set (10 tracks)</option>
                  <option value="15">Extended Club Set (15 tracks)</option>
                </select>
              </div>

            </div>
          </div>

          {/* Action Launch Button */}
          <div className="space-y-3">
            <button
              onClick={() => {
                soundFx.playAirhorn();
                onGenerate();
              }}
              disabled={isLoading || config.sources.length === 0 || !config.partyType}
              className="w-full py-5 px-6 rounded-2xl font-black text-lg bg-gradient-to-r from-emerald-500 via-cyan-500 to-fuchsia-500 hover:from-emerald-400 hover:to-fuchsia-400 text-slate-950 uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:shadow-[0_0_45px_rgba(6,182,212,0.8)] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed group transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? (
                <>
                  <Loader className="w-6 h-6 animate-spin text-slate-950" />
                  <span>Digging in the Crates...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 text-slate-950 group-hover:rotate-12 transition-transform" />
                  <span>GENERATE AI SETLIST</span>
                </>
              )}
            </button>

            {config.sources.length === 0 ? (
              <p className="text-red-400 text-xs text-center font-semibold flex items-center justify-center gap-1.5 bg-red-500/10 py-2.5 rounded-xl border border-red-500/20">
                <ShieldAlert className="w-4 h-4" /> Please connect at least one music crate above.
              </p>
            ) : !config.partyType ? (
              <p className="text-amber-400 text-xs text-center font-semibold bg-amber-500/10 py-2.5 rounded-xl border border-amber-500/20">
                Please enter a Type of Event (e.g. Birthday Bash) to continue.
              </p>
            ) : (
              <p className="text-slate-400 text-[11px] text-center font-mono">
                AI CO-HOST READY • INTEL-SYNC ACTIVE
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Add Custom Track Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-100 p-1"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <LinkIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-100">Add Custom Track / Stream</h3>
                <p className="text-xs text-slate-400">Support for direct MP3s, YouTube embeds, Spotify embeds, and Vocaroo.</p>
              </div>
            </div>

            <form onSubmit={handleAddCustomTrackSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Song Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neon Horizon"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Artist Name</label>
                <input
                  type="text"
                  placeholder="e.g. Synthwave King"
                  value={customArtist}
                  onChange={(e) => setCustomArtist(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Audio URL or Embed Link *</label>
                <input
                  type="text"
                  required
                  placeholder="https://voca.ro/... or youtube.com/... or .mp3 link"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:border-cyan-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Estimated BPM</label>
                  <input
                    type="number"
                    value={customBpm}
                    onChange={(e) => setCustomBpm(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:border-cyan-400 outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-100 border border-slate-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Folder className="w-4 h-4" />
                    <span>Upload File</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 uppercase font-black tracking-wider shadow-lg"
                >
                  Add To Crate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
