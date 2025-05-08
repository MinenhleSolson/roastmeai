// File: app/api/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

// Define allowed harshness levels on the server for validation with explicit type
const ALLOWED_HARSHNESS_LEVELS: string[] = [
  'Gentle Tease',
  'Standard Snark',
  'Brutal Honesty',
  'Inferno Mode',
];

export async function POST(req: NextRequest) {
  console.log("--- HIT /api/settings ---"); // Log: Route hit

  // 1. Check Authentication
  const { userId } = await auth();
  if (!userId) {
    console.log("API /api/settings: Unauthorized access attempt."); // Log
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.log(`API /api/settings: Authenticated user: ${userId}`); // Log: User ID

  // 2. Get and Validate Input
  let harshnessLevel: string;
  try {
    const body = await req.json();
    harshnessLevel = body.harshnessLevel;
    console.log(`API /api/settings: Received harshnessLevel: ${harshnessLevel}`); // Log: Received Level

    // Use the explicitly typed array for validation
    if (!harshnessLevel || typeof harshnessLevel !== 'string' || !ALLOWED_HARSHNESS_LEVELS.includes(harshnessLevel)) {
       console.log(`API /api/settings: Invalid harshnessLevel received: ${harshnessLevel}`); // Log: Invalid Level
       return NextResponse.json({ error: 'Invalid or missing harshnessLevel value provided.' }, { status: 400 });
    }

  } catch (error) {
    console.error("API /api/settings: Error parsing request body:", error); // Log: Body parse error
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  // 3. Connect to DB
  try {
    console.log("API /api/settings: Connecting to DB..."); // Log
    await dbConnect();
    console.log("API /api/settings: DB connected successfully."); // Log
  } catch (dbError) {
     console.error("API /api/settings: Database connection failed:", dbError); // Log: DB Connect Error
     return NextResponse.json({ error: "Database connection error." }, { status: 500 });
  }

  // 4. Update User Settings in DB
  try {
    console.log(`API /api/settings: Attempting findOneAndUpdate for clerkId: ${userId} with level: ${harshnessLevel}`); // Log: Update attempt
    const updatedUser = await User.findOneAndUpdate(
      { clerkId: userId }, // Query condition
      { $set: { harshnessLevel: harshnessLevel } }, // Update operation
      { new: true, upsert: false } // Options: return updated doc, don't create if not found
    );

    // Log the result of the update operation
    console.log(`API /api/settings: findOneAndUpdate result:`, updatedUser); // Log: Result

    if (!updatedUser) {
       // If null, the user document wasn't found with that clerkId
       console.error(`API /api/settings: User with clerkId ${userId} NOT FOUND for update.`); // Log: Not Found Error
       return NextResponse.json({ error: "User profile not found in database." }, { status: 404 });
    }

    console.log(`API /api/settings: Settings updated successfully for user ${userId}. New level: ${updatedUser.harshnessLevel}`); // Log: Success
    return NextResponse.json({ success: true, message: 'Settings saved successfully.' });

  } catch (error) {
     console.error(`API /api/settings: Error during findOneAndUpdate for user ${userId}:`, error); // Log: Update Error
     return NextResponse.json({ error: "Failed to update settings in database." }, { status: 500 });
  }
}