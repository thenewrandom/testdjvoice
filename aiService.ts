import { PartyConfig, Track, DjScript } from '../types';
import { PERSONAS } from '../data/personas';

const getPersona = (id: string) => PERSONAS.find(p => p.id === id) || PERSONAS[0];

export async function generateSetlist(config: PartyConfig, allTracks: Track[]): Promise<Track[]> {
  await new Promise(r => setTimeout(r, 350));
  const targetCount = Math.max(1, parseInt(config.duration, 10) || 5);
  const persona = getPersona(config.persona);
  const [minBpm, maxBpm] = persona.defaultBpmRange;

  const scored = [...allTracks].map(track => {
    const bpmDistance = track.bpm < minBpm ? minBpm - track.bpm : track.bpm > maxBpm ? track.bpm - maxBpm : 0;
    const genreMatch = track.genre.toLowerCase().includes(persona.genre.split('/')[0].trim().toLowerCase()) ? 18 : 0;
    const sourceBoost = track.id.startsWith('sb-') ? 8 : 0;
    return { track, score: genreMatch + sourceBoost - bpmDistance * 0.8 + Math.random() * 12 };
  });

  const selected = scored.sort((a, b) => b.score - a.score).slice(0, targetCount).map(x => x.track);
  return selected.sort((a, b) => a.energy - b.energy);
}

export async function generateScript(config: PartyConfig, setlist: Track[]): Promise<DjScript> {
  const persona = getPersona(config.persona);
  if (config.useGeminiAi) {
    try {
      const response = await fetch('/api/dj-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, setlist, persona }),
      });
      if (response.ok) {
        const parsed = await response.json();
        if (parsed?.intro && Array.isArray(parsed.interstitials) && parsed.outro) {
          return { intro: parsed.intro, interstitials: parsed.interstitials, outro: parsed.outro };
        }
      }
    } catch (error) {
      console.warn('Server-side Gemini unavailable; using local DJ script fallback.', error);
    }
  }

  const talkativity = config.interactionLevel || 5;
  const guestStr = config.guestOfHonor ? `VIP ${config.guestOfHonor}` : 'everybody in the room';
  const eventName = config.partyType || 'party';
  const moodName = config.mood || 'unstoppable';
  const catchphrase = () => persona.catchphrases[Math.floor(Math.random() * persona.catchphrases.length)];
  const intro = `Yo! Welcome to the ${eventName}. ${guestStr}, this one is for you. I'm DJ ${persona.name}, and we're setting the ${moodName} tone right now. ${catchphrase()}`;
  const interstitials = setlist.slice(0, -1).map((song, i) => {
    const next = setlist[i + 1];
    if (talkativity <= 3) return `Keep it moving. Next up: ${next.title} by ${next.artist}.`;
    if (talkativity <= 6) return `That was ${song.title}. We're keeping the momentum clean and smooth — next, ${next.title} by ${next.artist}.`;
    return `${catchphrase()} That groove is locked in. We're taking it up another notch with ${next.title} by ${next.artist}. Let's go!`;
  });
  const outro = `And that's the set. Big love to everybody who rode with DJ ${persona.name} tonight. Keep the music loud, keep the energy right, and I'll catch you on the next one.`;
  return { intro, interstitials, outro };
}

export async function generateVoice(text: string, persona: ReturnType<typeof getPersona>): Promise<HTMLAudioElement | null> {
  try {
    const response = await fetch('/api/dj-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice: persona.voiceName, persona: persona.name, style: persona.voiceStyle }),
    });
    if (!response.ok) throw new Error('TTS API unavailable');
    const payload = await response.json();
    if (!payload.audioBase64) throw new Error('No audio returned');
    const binary = atob(payload.audioBase64);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    const audio = new Audio(URL.createObjectURL(new Blob([bytes], { type: payload.mimeType || 'audio/wav' })));
    return audio;
  } catch (error) {
    console.warn('Realistic DJ voice unavailable; falling back to browser speech.', error);
    return null;
  }
}
