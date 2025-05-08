// app/dashboard/settings/page.tsx
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import User, { IUser } from '@/models/User';
import SettingsView from '@/components/SettingsView'; // We'll create this next

// This is an async Server Component
export default async function SettingsPage() {
  let currentHarshness = 'Standard Snark'; // Default value
  let userEmail = ''; // To pass for display, optional

  const user = await currentUser();

  if (user) {
    userEmail = user.primaryEmailAddress?.emailAddress || '';
    try {
      await dbConnect();
      const dbUser = await User.findOne({ clerkId: user.id });
      if (dbUser && dbUser.harshnessLevel) {
        currentHarshness = dbUser.harshnessLevel;
      } else if (!dbUser) {
         // Handle case where user is somehow not in DB yet, though dashboard should create them
         console.warn(`Settings page: User ${user.id} not found in DB.`);
         // Could potentially create the user here too if needed
      }
      // If dbUser exists but has no harshnessLevel, the default 'Standard Snark' will be used
    } catch (error) {
      console.error("Error fetching user settings:", error);
      // Use default value on error
    }
  } else {
     // Handle case where user is not logged in (middleware should prevent this)
     console.error("Settings page: No logged-in user found.");
     // Potentially redirect or show an error message
     // For now, default harshness will be passed
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="text-slate-400">Adjust your roasting preferences.</p>
      {/* Pass the fetched setting to the client component */}
      <SettingsView initialHarshness={currentHarshness} userEmail={userEmail} />
    </div>
  );
}