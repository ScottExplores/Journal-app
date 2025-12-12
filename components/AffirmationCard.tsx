import React, { useState, useEffect } from 'react';
import { generateAffirmation, generateSpeechFromText } from '../services/geminiService';

const AffirmationCard: React.FC = () => {
  const [affirmation, setAffirmation] = useState<string>("Loading a gentle thought for you...");
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for today's affirmation to avoid regenerating on every refresh
    const today = new Date().toDateString();
    const stored = localStorage.getItem('daily_affirmation');
    const storedDate = localStorage.getItem('daily_affirmation_date');

    if (stored && storedDate === today) {
      setAffirmation(stored);
      setLoading(false);
    } else {
      fetchNewAffirmation();
    }
  }, []);

  const fetchNewAffirmation = async () => {
    setLoading(true);
    const text = await generateAffirmation();
    setAffirmation(text);
    localStorage.setItem('daily_affirmation', text);
    localStorage.setItem('daily_affirmation_date', new Date().toDateString());
    setLoading(false);
  };

  const playAffirmation = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    
    try {
      const audioBuffer = await generateSpeechFromText(affirmation);
      if (audioBuffer) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
        source.onended = () => setIsPlaying(false);
      } else {
        setIsPlaying(false);
      }
    } catch (e) {
      console.error(e);
      setIsPlaying(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-calm-100 to-lavender-100 rounded-3xl p-8 shadow-sm mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-20 rounded-full blur-xl"></div>
      
      <div className="relative z-10 text-center">
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-4">Daily Whisper</h2>
        
        {loading ? (
          <div className="animate-pulse h-16 bg-white/40 rounded-lg mx-auto w-3/4"></div>
        ) : (
          <p className="font-serif text-2xl md:text-3xl text-slate-700 italic leading-relaxed">
            "{affirmation}"
          </p>
        )}

        <div className="mt-6 flex justify-center gap-4">
          <button 
            onClick={playAffirmation}
            disabled={loading || isPlaying}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              isPlaying 
              ? 'bg-lavender-200 text-lavender-700' 
              : 'bg-white/60 hover:bg-white text-slate-600 hover:shadow-md'
            }`}
          >
            {isPlaying ? (
              <>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lavender-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-lavender-500"></span>
                </span>
                Listening...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                </svg>
                Listen
              </>
            )}
          </button>
          
          <button 
            onClick={fetchNewAffirmation}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/60 hover:bg-white text-slate-600 hover:shadow-md transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 4.992 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            New Card
          </button>
        </div>
      </div>
    </div>
  );
};

export default AffirmationCard;
