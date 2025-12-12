import React, { useState, useEffect } from 'react';
import { JournalEntry } from '../types';

const Journal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('journal_entries');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  const saveEntry = () => {
    if (!newEntry.trim()) return;

    const entry: JournalEntry = {
      id: Date.now().toString(),
      content: newEntry,
      date: new Date().toISOString(),
    };

    const updated = [entry, ...entries];
    setEntries(updated);
    localStorage.setItem('journal_entries', JSON.stringify(updated));
    setNewEntry('');
    setIsExpanded(false);
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-serif text-slate-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-calm-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
          My Clarity Journal
        </h3>
      </div>

      <div className="mb-6">
        <textarea
          className="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-calm-300 resize-none transition-all text-slate-600 placeholder:text-slate-400"
          placeholder="How are you feeling right now? Write it down to clear your mind..."
          rows={isExpanded ? 6 : 3}
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value)}
          onFocus={() => setIsExpanded(true)}
        />
        {isExpanded && (
          <div className="flex justify-end gap-2 mt-2">
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 text-sm px-3 py-1 hover:text-slate-600"
            >
              Cancel
            </button>
            <button 
              onClick={saveEntry}
              className="bg-calm-500 hover:bg-calm-600 text-white px-4 py-1 rounded-full text-sm font-medium transition-colors"
            >
              Save Note
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[400px]">
        {entries.length === 0 && (
          <p className="text-center text-slate-400 text-sm mt-8 italic">No entries yet. Start writing whenever you're ready.</p>
        )}
        {entries.map((entry) => (
          <div key={entry.id} className="group relative pl-4 border-l-2 border-calm-200 py-1 hover:border-calm-400 transition-colors">
            <p className="text-xs text-slate-400 font-medium mb-1">{formatDate(entry.date)}</p>
            <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{entry.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Journal;
