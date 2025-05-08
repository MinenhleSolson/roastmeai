// File: app/dashboard/layout.tsx
'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar'; // Assuming components are in root 'components' folder
import { Menu, X } from 'lucide-react';
import { UserButton } from '@clerk/nextjs'; // Added UserButton for potential use in mobile header

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    // Changed structure: Outer flex container
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-black to-gray-900">

        {/* --- Desktop Sidebar (Fixed) --- */}
        {/* Hidden below 'md' breakpoint, occupies fixed width */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
            <Sidebar isMobile={false} />
        </div>

        {/* --- Mobile Sidebar (Off-canvas) --- */}
        {/* Rendered conditionally based on state, overlays everything */}
        {isSidebarOpen && (
            <>
                {/* Background Overlay */}
                <div
                    className="fixed inset-0 z-40 bg-gray-900/80 md:hidden" // Only show overlay on mobile
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden="true"
                />
                {/* Sidebar Panel */}
                <div
                    className="fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto bg-gray-900 ring-1 ring-white/10 transition-transform duration-300 ease-in-out md:hidden" // Only show panel on mobile
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                >
                    {/* Top section of mobile sidebar with close button */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-700">
                        <span className="text-xl font-bold text-orange-400">RoastMe<span className="text-red-500">.ai</span> 🔥</span>
                        <button
                            type="button"
                            className="-m-2.5 p-2.5 text-gray-400 hover:text-white"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <span className="sr-only">Close sidebar</span>
                            <X className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                    {/* Pass close function to allow links inside sidebar to close it */}
                    <Sidebar isMobile={true} closeSidebar={() => setIsSidebarOpen(false)} />
                </div>
            </>
        )}

        {/* --- Main Content Area Wrapper --- */}
        {/* This column takes remaining space and handles padding offset for DESKTOP sidebar */}
        <div className="flex flex-1 flex-col md:pl-64"> {/* Apply padding offset only on md+ screens */}

            {/* Mobile Header (Sticky) */}
            {/* Shown only below 'md' breakpoint, part of the main content flow */}
            <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-6 border-b border-gray-700 bg-gray-900 px-4 shadow-sm sm:px-6 md:hidden">
                {/* Hamburger button to open mobile sidebar */}
                <button
                    type="button"
                    className="-m-2.5 p-2.5 text-gray-400"
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <span className="sr-only">Open sidebar</span>
                    <Menu className="h-6 w-6" aria-hidden="true" />
                </button>
                 {/* Mobile Title/Placeholder */}
                <div className="flex-1 text-sm font-semibold leading-6 text-white">RoastMe.ai Menu</div>
                {/* Optional: User button in mobile header */}
                 <UserButton afterSignOutUrl="/" />
            </div>

            {/* Actual Page Content */}
            {/* Takes remaining vertical space, has own padding */}
            <main className="flex-1 py-8">
                <div className="px-4 sm:px-6 lg:px-8">
                    {/* Child pages (like app/dashboard/page.tsx) render here */}
                    {children}
                </div>
            </main>
        </div>
    </div>
  );
}