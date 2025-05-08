'use client';

import React, { useState, ChangeEvent } from 'react';
import { UploadCloud, FileText } from 'lucide-react'; 

// Define props type
interface RoastArenaProps {
  initialTokens: number;
}

export default function RoastArena({ initialTokens }: RoastArenaProps) {
  // --- State Variables ---
  const [inputType, setInputType] = useState<'bio' | 'image'>('bio');
  const [bio, setBio] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [roastResult, setRoastResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState(initialTokens);

  // --- Event Handlers ---
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
          setError(`File is too large (Max ${maxSize / 1024 / 1024}MB)`);
          setSelectedFile(null);
          setFileName('');
          event.target.value = '';
          return;
      }
      setSelectedFile(file);
      setFileName(file.name);
      setError(null);
    } else {
      setSelectedFile(null);
      setFileName('');
    }
  };

  const handleRoastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('SUBMIT: Starting handleRoastSubmit'); // <-- Debug log
    console.log('SUBMIT: Setting isLoading = TRUE'); // <-- Debug log
    setIsLoading(true); // <-- Sets disabled state on inputs/button
    setRoastResult(null);
    setError(null);

    // --- Validation ---
    if (inputType === 'bio' && !bio.trim()) {
        console.log('SUBMIT: Validation failed - empty bio'); // <-- Debug log
        setError("Bio can't be empty if you want a proper roasting!");
        console.log('SUBMIT: Setting isLoading = FALSE (validation fail)'); // <-- Debug log
        setIsLoading(false);
        return;
    }
    if (inputType === 'image' && !selectedFile) {
      console.log('SUBMIT: Validation failed - no image selected'); // <-- Debug log
      setError("You selected image upload, but didn't choose an image!");
      console.log('SUBMIT: Setting isLoading = FALSE (validation fail)'); // <-- Debug log
      setIsLoading(false);
      return;
    }
    // --- End Validation ---

    let requestBody: string | FormData;
    let headers: HeadersInit = {};
    const apiEndpoint = '/api/roast';

    try {
      console.log('SUBMIT: Preparing request body for type:', inputType); // <-- Debug log
      if (inputType === 'bio') {
          headers = { 'Content-Type': 'application/json' };
          requestBody = JSON.stringify({ bio: bio });
      } else if (inputType === 'image' && selectedFile) {
          const formData = new FormData();
          formData.append('image', selectedFile);
          requestBody = formData;
          // No headers set here for FormData
      } else {
          throw new Error("Invalid input type or missing data.");
      }

      console.log('SUBMIT: Sending fetch request to:', apiEndpoint); // <-- Debug log
      // --- Make the API Call ---
      const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: headers,
          body: requestBody,
      });
      console.log('SUBMIT: Fetch response status:', response.status); // <-- Debug log

      const data = await response.json();

      if (!response.ok) {
          console.log('SUBMIT: Fetch response NOT OK:', data); // <-- Debug log
          throw new Error(data.error || `Error: ${response.status}`);
      }

      console.log('SUBMIT: Fetch response OK, Roast:', data.roast); // <-- Debug log
      setRoastResult(data.roast);
      setTokens(prev => Math.max(0, prev - 1));

    } catch (err: any) {
      console.error("SUBMIT: Failed to fetch roast:", err); // <-- Log full error object
      setError(err.message || "An unknown error occurred processing the roast.");
    } finally {
      // This block *should* always run after try/catch
      console.log('SUBMIT: Setting isLoading = FALSE (in finally block)'); // <-- Debug log
      setIsLoading(false); // <-- Should re-enable inputs/button
    }
  };

  // --- JSX Rendering ---
  // Add console log to see current loading state on each render
  console.log('RENDERING RoastArena, isLoading:', isLoading);

  return (
    <div className="space-y-8 w-full">
      {/* Token Display */}
      <div className='text-center mb-10'>
           <p className='text-2xl md:text-3xl font-bold text-orange-400'>
             Roasts Remaining: 🔥 {tokens}
           </p>
      </div>

      {/* Title and Description */}
      <h1 className="text-3xl md:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
          Step into the Roast Arena
      </h1>
      <p className="text-center text-slate-300 text-lg md:text-xl">
          Choose your weapon: Spill your bio or upload a pic.
      </p>

      {/* Input Type Toggle */}
      <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => { setInputType('bio'); setError(null); setFileName(''); setSelectedFile(null); /* Clear other input state */ }}
            // Adding back full styling from previous working example
            className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              inputType === 'bio'
                ? 'bg-red-600 text-white ring-2 ring-offset-2 ring-offset-slate-900 ring-red-500' // Enhanced active state
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
            disabled={isLoading} // Also disable toggle buttons when loading
          >
              <FileText size={18} /> Write Bio
          </button>
          <button
            onClick={() => { setInputType('image'); setError(null); setBio(''); /* Clear other input state */ }}
            // Adding back full styling from previous working example
            className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              inputType === 'image'
                ? 'bg-red-600 text-white ring-2 ring-offset-2 ring-offset-slate-900 ring-red-500' // Enhanced active state
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
            disabled={isLoading} // Also disable toggle buttons when loading
          >
              <UploadCloud size={18} /> Upload Image
          </button>
      </div>

      {/* Form Area */}
      <form onSubmit={handleRoastSubmit} className="space-y-4">
          {inputType === 'bio' ? (
              // Bio Text Area - Added back props/styling
              <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Spill the tea... or just your boring bio."
                  rows={6}
                  className={`w-full p-4 bg-slate-800 border rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-shadow duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-orange-500'}`}
                  disabled={isLoading}
                  aria-invalid={!!error}
                  aria-describedby={error ? "input-error" : undefined}
              />
          ) : (
              // Image Upload Area - Added back props/styling
              <div className="flex flex-col items-center justify-center w-full">
                  <label
                      htmlFor="file-upload"
                      className={`flex flex-col items-center justify-center w-full h-48 border-2 rounded-lg transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${error ? 'border-red-500 hover:border-red-600 bg-red-900/20 hover:bg-red-900/30' : 'border-slate-700 hover:border-slate-600 bg-slate-800 hover:bg-slate-700'} border-dashed`}
                  >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-400">
                          <UploadCloud className="w-10 h-10 mb-3" />
                          <p className="mb-2 text-sm"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                          <p className="text-xs">PNG, JPG, WEBP (Max 5MB)</p>
                          {fileName && !isLoading && <p className="text-xs mt-2 text-green-400">Selected: {fileName}</p>}
                          {isLoading && <p className="text-xs mt-2 text-yellow-400">Uploading...</p>}
                      </div>
                      <input
                          id="file-upload"
                          type="file"
                          className="hidden" // Keep hidden
                          onChange={handleFileChange}
                          accept="image/png, image/jpeg, image/webp"
                          disabled={isLoading} // Disable during loading
                          aria-describedby={error ? "input-error" : undefined}
                      />
                  </label>
              </div>
          )}

          {/* Error Message */}
          {error && ( <p id="input-error" className="text-center text-red-400 text-sm font-medium">{error}</p> )}

          {/* Submit Button - Added back props/styling */}
          <div className="text-center pt-4">
              <button
                  type="submit"
                  // Re-added full disabled logic
                  disabled={isLoading || (inputType === 'bio' && !bio.trim()) || (inputType === 'image' && !selectedFile)}
                  // Re-added full styling logic
                  className={`px-8 py-3 rounded-lg font-semibold text-white transition duration-200 ease-in-out ${
                  isLoading || (inputType === 'bio' && !bio.trim()) || (inputType === 'image' && !selectedFile)
                      ? 'bg-gray-600 cursor-not-allowed opacity-70'
                      : 'bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 transform hover:scale-105'
                  }`}
              >
                  {isLoading ? 'Heating up the AI...' : 'Roast Me!'}
              </button>
          </div>
      </form>

      {/* Result Display - Added back props/styling */}
      {roastResult && !isLoading && (
         <div className="mt-10 p-6 bg-slate-800 border border-slate-700 rounded-xl shadow-md animate-fade-in w-full"> {/* Ensure animate-fade-in exists in globals.css if used */}
            <h2 className="text-xl font-semibold mb-3 text-orange-300">The Verdict 🔥</h2>
            <p className="text-md text-white whitespace-pre-wrap">{roastResult}</p>
          </div>
      )}
    </div>
  );
}