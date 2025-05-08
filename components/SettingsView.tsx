// components/SettingsView.tsx
'use client';

import React, { useState, useEffect } from 'react';

// Define the possible harshness levels
const HARSHNESS_LEVELS = [
  { id: 'gentle-tease', value: 'Gentle Tease', description: 'Light pokes, mostly harmless.' },
  { id: 'standard-snark', value: 'Standard Snark', description: 'Playful jabs, classic roast style.' },
  { id: 'brutal-honesty', value: 'Brutal Honesty', description: 'Sharper critique, might sting a bit.' },
  { id: 'inferno-mode', value: 'Inferno Mode', description: 'No holds barred. Enter at your own risk!' },
];

interface SettingsViewProps {
  initialHarshness: string;
  userEmail: string; // Optional: Display user info
}

export default function SettingsView({ initialHarshness, userEmail }: SettingsViewProps) {
  const [selectedLevel, setSelectedLevel] = useState(initialHarshness);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset save status after a few seconds
  useEffect(() => {
    if (saveStatus === 'success' || saveStatus === 'error') {
      const timer = setTimeout(() => setSaveStatus('idle'), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ harshnessLevel: selectedLevel }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings.');
      }

      setSaveStatus('success');
      // Optionally update initialHarshness if needed, though page reload would fetch new value
    } catch (error: any) {
      console.error("Error saving settings:", error);
      setErrorMessage(error.message || 'An unexpected error occurred.');
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-md space-y-6">
       {/* Optional: Display user info */}
       {userEmail && <p className="text-sm text-slate-500">Settings for: {userEmail}</p>}

      <fieldset>
        <legend className="text-base font-semibold leading-6 text-white">Roast Harshness Level</legend>
        <p className="mt-1 text-sm text-slate-400">Choose how hard you want the AI to go.</p>
        <div className="mt-4 space-y-4">
          {HARSHNESS_LEVELS.map((level) => (
            <div key={level.id} className="flex items-start gap-x-3 p-3 rounded-md hover:bg-slate-800/50 transition-colors">
              <div className="flex h-6 items-center">
                <input
                  id={level.id}
                  name="harshness-level"
                  type="radio"
                  value={level.value}
                  checked={selectedLevel === level.value}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  disabled={isSaving}
                  className="h-4 w-4 border-gray-600 bg-gray-700 text-red-600 focus:ring-red-600 focus:ring-offset-gray-900 disabled:opacity-50"
                />
              </div>
              <div className="text-sm leading-6">
                <label htmlFor={level.id} className={`block font-medium ${selectedLevel === level.value ? 'text-orange-400' : 'text-white'}`}>
                  {level.value}
                </label>
                <p className="text-slate-400">{level.description}</p>
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <div className="flex items-center gap-x-4">
         <button
            onClick={handleSaveSettings}
            disabled={isSaving || selectedLevel === initialHarshness} // Disable if saving or no change
            className={`rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition-colors ${
              isSaving || selectedLevel === initialHarshness
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
            >
            {isSaving ? 'Saving...' : 'Save Settings'}
         </button>
         {saveStatus === 'success' && <p className="text-sm text-green-400">Settings saved successfully!</p>}
         {saveStatus === 'error' && <p className="text-sm text-red-400">Error: {errorMessage}</p>}
      </div>
    </div>
  );
}