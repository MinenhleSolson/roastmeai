
import React from 'react';
import Link from 'next/link';
import { UserButton, useUser } from "@clerk/nextjs";
import { Flame, Settings, Coins } from 'lucide-react'; // Import icons

// Define props if needed, e.g., for mobile interaction
interface SidebarProps {
  isMobile?: boolean;
  closeSidebar?: () => void;
}

export default function Sidebar({ isMobile = false, closeSidebar }: SidebarProps) {
  const { user } = useUser(); // Get user info if needed

  const handleLinkClick = () => {
    if (isMobile && closeSidebar) {
      closeSidebar();
    }
  };

  const navItems = [
    { name: 'Roast Arena', href: '/dashboard', icon: Flame },
    { name: 'Tune the Heat', href: '/dashboard/settings', icon: Settings }, // We'll handle routing/views later
    
  ];

  // TODO: Add logic to determine the current active path for highlighting

  return (
    <div className={`flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 ${isMobile ? 'pb-4' : 'pb-4 border-r border-gray-700'}`}>
      {!isMobile && (
        <Link href="/dashboard" className="flex h-16 shrink-0 items-center">
           <span className="text-2xl font-bold text-orange-400">RoastMe<span className="text-red-500">.ai</span> 🔥</span>
        </Link>
      )}
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          {/* Navigation Items */}
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    // Add active link styling later based on current path
                    className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-400 hover:text-white hover:bg-gray-800`}
                  >
                    <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>

          {/* User Profile Button at the bottom */}
          <li className="-mx-6 mt-auto">
             <div className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white border-t border-gray-700 pt-4">
                 <UserButton afterSignOutUrl="/" />
                 <span className="truncate">{user?.primaryEmailAddress?.emailAddress || 'Profile'}</span>
             </div>
          </li>
        </ul>
      </nav>
    </div>
  );
}