// app/dashboard/page.tsx
import RoastArena from '@/components/RoastArena';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect'; // Import DB connection utility
import User, { IUser } from '@/models/User';    // Import User model

// Make the component async to use await
export default async function DashboardPage() {
  let initialTokens = 0; // Default token count
  let dbUser: IUser | null = null;

  // Get Clerk user data on the server
  const user = await currentUser();

  if (user) {
    try {
      await dbConnect(); // Ensure DB connection

      // Find user in DB by Clerk ID
      dbUser = await User.findOne({ clerkId: user.id });

      if (dbUser) {
        console.log(`Found user ${user.id} in DB with ${dbUser.tokens} tokens.`);
        initialTokens = dbUser.tokens;
      } else {
        // User exists in Clerk but not in our DB yet -> Create them
        console.log(`User ${user.id} not found in DB, creating new entry...`);
        const userEmail = user.primaryEmailAddress?.emailAddress;
        if (!userEmail) {
            throw new Error("User email not available from Clerk."); // Should not happen if user exists
        }
        const newUser = new User({
          clerkId: user.id,
          email: userEmail,
          tokens: 5, // Assign default free tokens
          // Set other default fields if necessary
        });
        await newUser.save();
        console.log(`New user ${user.id} created with 5 tokens.`);
        initialTokens = 5; // Set initial tokens for the new user
        dbUser = newUser; // Assign the newly created user
      }
    } catch (error) {
      console.error("Error fetching or creating user data:", error);
      // Handle error appropriately - maybe show an error message on the page
      // For now, we'll default to 0 tokens if there's an error
      initialTokens = 0;
    }
  } else {
     console.log("No logged-in user found by Clerk.");
     // Should technically not happen if middleware protects this page, but handle defensively
  }

  return (
    <div>
      {/* Pass the fetched or default token count */}
      <RoastArena initialTokens={initialTokens} />
    </div>
  );
}