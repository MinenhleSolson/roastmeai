// app/page.tsx
'use client'; // Add this line if not already present, needed for useAuth hook

import Link from 'next/link';
import { useAuth, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs"; // Import real Clerk components/hooks

export default function LandingPage() {
  // Use the real useAuth hook from Clerk
  const { isSignedIn } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-black to-slate-900 text-white">

      {/* Navigation Bar */}
      <nav className="w-full p-4 md:p-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-orange-400">
            RoastMe<span className="text-red-500">.ai</span> 🔥
          </Link>

          {/* Real Auth Buttons */}
          <div className="flex items-center space-x-3">
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" /> // User button shown when signed in
            ) : (
              <>
                {/* Use Clerk's modal mode for sign-in/up */}
                <SignInButton mode="modal">
                   {/* You can optionally style the button Clerk uses */}
                   <button className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm font-medium transition-colors">
                     Sign In
                   </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm font-medium transition-colors">
                    Sign Up
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section (remains the same as before) */}
      <main className="flex-grow flex items-center justify-center px-4 text-center">
         {/* ... (rest of the hero section code is unchanged) ... */}
         <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
            Think Your Ego's Bulletproof?
            <br />
            <span className="block text-red-500 drop-shadow-md mt-2 md:mt-4">Let Our AI Take a Shot.</span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-xl mx-auto">
            Upload a pic or spill your bio. We'll serve up a personalized, sizzling roast guaranteed to (harmlessly) humble you.
          </p>

          <div>
            <Link
               // Adjust routing logic as needed after Clerk integration
               href={isSignedIn ? "/dashboard" : "/sign-up"} // Example: Go to /roast if signed in, else prompt sign-up
               className="inline-block bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white px-8 py-4 rounded-lg text-xl font-semibold shadow-lg transform transition duration-200 ease-in-out hover:scale-105"
            >
              Enter the Roast Arena
            </Link>
          </div>

          <p className="text-sm text-slate-400">
            Roasting is free. No therapy included.
          </p>
        </div>
      </main>

       {/* Footer (remains the same) */}
       <footer className="w-full p-4 text-center text-slate-500 text-xs">
          RoastMe.ai &copy; {new Date().getFullYear()} | Handle with humor.
       </footer>
    </div>
  );
}