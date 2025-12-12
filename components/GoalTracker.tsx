import React, { useState, useEffect } from 'react';
import { Goal } from '../types';

const GoalTracker: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [newGoalText, setNewGoalText] = useState('');
  const [noTimeline, setNoTimeline] = useState(false);
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('goals');
    if (saved) {
      setGoals(JSON.parse(saved));
    }
  }, []);

  const updateGoals = (updated: Goal[]) => {
    setGoals(updated);
    localStorage.setItem('goals', JSON.stringify(updated));
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;

    const goal: Goal = {
      id: Date.now().toString(),
      text: newGoalText,
      completed: false,
      dueDate: noTimeline ? null : dueDate || null,
    };

    updateGoals([...goals, goal]);
    
    // Reset and close
    setNewGoalText('');
    setNoTimeline(false);
    setDueDate('');
    setIsModalOpen(false);
  };

  const toggleGoal = (id: string) => {
    const updated = goals.map(g => 
      g.id === id ? { ...g, completed: !g.completed } : g
    );
    updateGoals(updated);
  };

  const deleteGoal = (id: string) => {
    const updated = goals.filter(g => g.id !== id);
    updateGoals(updated);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full flex flex-col relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-serif text-slate-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-lavender-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
          </svg>
          Small Wins & Goals
        </h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-lavender-500 hover:bg-lavender-600 text-white p-2 rounded-xl transition-colors shadow-sm"
          title="Add new goal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-[400px]">
         {goals.length === 0 && (
          <p className="text-center text-slate-400 text-sm mt-8 italic">One step at a time. Click + to add a goal.</p>
        )}
        {goals.map((goal) => (
          <div 
            key={goal.id} 
            className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
              goal.completed ? 'bg-slate-50 opacity-60' : 'bg-white border border-slate-100 shadow-sm'
            }`}
          >
            <button
              onClick={() => toggleGoal(goal.id)}
              className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                goal.completed 
                  ? 'bg-lavender-400 border-lavender-400 text-white' 
                  : 'border-slate-300 text-transparent hover:border-lavender-400'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="flex-1">
              <span className={`block text-sm leading-tight ${goal.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                {goal.text}
              </span>
              {goal.dueDate && !goal.completed && (
                <span className="text-xs text-lavender-500 font-medium mt-1 inline-block bg-lavender-50 px-2 py-0.5 rounded-md">
                  Due {formatDate(goal.dueDate)}
                </span>
              )}
            </div>
            <button 
              onClick={() => deleteGoal(goal.id)}
              className="text-slate-300 hover:text-red-400 transition-colors mt-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 0 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Add Goal Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm rounded-3xl" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 relative z-10 border border-slate-100 animate-fade-in-up">
            <h4 className="font-serif text-lg text-slate-700 mb-4">Set a New Goal</h4>
            
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">What would you like to achieve?</label>
                <input
                  type="text"
                  value={newGoalText}
                  onChange={(e) => setNewGoalText(e.target.value)}
                  placeholder="e.g., Call lawyer, 10 min meditation..."
                  className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-lavender-300 placeholder:text-slate-400"
                  autoFocus
                />
              </div>

              <div>
                 <div className="flex items-center justify-between mb-1">
                   <label className={`block text-xs font-medium ${noTimeline ? 'text-slate-300' : 'text-slate-500'}`}>Target Date</label>
                   <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={noTimeline} 
                        onChange={(e) => setNoTimeline(e.target.checked)}
                        className="w-4 h-4 text-lavender-500 rounded border-slate-300 focus:ring-lavender-400"
                      />
                      <span className="text-xs text-slate-500">No timeline</span>
                   </label>
                 </div>
                 <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={noTimeline}
                  className={`w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-lavender-300 ${noTimeline ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newGoalText.trim()}
                  className="flex-1 bg-lavender-500 hover:bg-lavender-600 text-white py-2 rounded-xl text-sm font-medium shadow-md transition-colors disabled:opacity-50"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalTracker;