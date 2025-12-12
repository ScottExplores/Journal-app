import React, { useState } from 'react';
import AffirmationCard from './components/AffirmationCard';
import Journal from './components/Journal';
import GoalTracker from './components/GoalTracker';
import AiCompanion from './components/AiCompanion';
import VisionBoard from './components/VisionBoard';

type ViewMode = 'dashboard' | 'vision';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-12 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-calm-400 to-lavender-400 flex items-center justify-center text-white font-serif font-bold italic">
              C
            </div>
            <h1 className="font-serif text-lg md:text-xl font-semibold text-slate-700 tracking-tight">
              Clarity & Comfort
            </h1>
          </div>
          <div className="text-xs text-slate-400 hidden sm:block">
            One breath at a time.
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Top Section: Daily Affirmation */}
        <section className="animate-fade-in-down mb-8">
          <AffirmationCard />
        </section>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-full shadow-sm border border-slate-100 inline-flex">
            <button
              onClick={() => setViewMode('dashboard')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                viewMode === 'dashboard'
                  ? 'bg-calm-100 text-calm-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              My Day
            </button>
            <button
              onClick={() => setViewMode('vision')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                viewMode === 'vision'
                  ? 'bg-purple-100 text-purple-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              Vision Board
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        {viewMode === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            {/* Left Column: Journal & Goals - Removed fixed heights to allow scrolling */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="min-h-[400px]">
                <Journal />
              </div>
              <div className="min-h-[300px]">
                <GoalTracker />
              </div>
            </div>

            {/* Right Column: AI Companion */}
            <div className="lg:col-span-7">
              <div className="min-h-[600px] h-full">
                <AiCompanion />
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <VisionBoard />
          </div>
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-4 text-center py-8 text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} Clarity & Comfort. You are loved.</p>
      </footer>
    </div>
  );
};

export default App;