// File: app/api/roast/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
    Part
} from "@google/generative-ai";
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("FATAL: Gemini API Key is not defined in environment variables.");
}
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

function bufferToBase64(buffer: ArrayBuffer): string {
    return Buffer.from(buffer).toString('base64');
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!genAI) {
    return NextResponse.json({ error: "AI Service Unavailable: API Key missing or invalid." }, { status: 503 });
  }

  try {
    await dbConnect();
  } catch (dbError) {
     console.error("Database connection failed in API route:", dbError);
     return NextResponse.json({ error: "Database connection error." }, { status: 500 });
  }

  let dbUser;
  try {
      dbUser = await User.findOne({ clerkId: userId });
      if (!dbUser) {
          console.error(`User ${userId} authenticated but not found in database.`);
          return NextResponse.json({ error: "User profile not found in database." }, { status: 404 });
      }
      if (dbUser.tokens <= 0) {
          console.log(`User ${userId} attempted roast with 0 tokens.`);
          return NextResponse.json({ error: "You're out of roast tokens! Please purchase more." }, { status: 402 });
      }
       console.log(`User ${userId} has ${dbUser.tokens} tokens remaining.`);
  } catch (error) {
       console.error(`Error fetching user ${userId} from DB:`, error);
       return NextResponse.json({ error: "Error checking user tokens." }, { status: 500 });
  }

  const contentType = req.headers.get('content-type') || '';
  try {
    let modelName: string = "gemini-1.5-flash";
    let bioText: string | null = null;
    let imagePart: Part | null = null;
    let inputType: 'bio' | 'image';

    if (contentType.includes('application/json')) {
        inputType = 'bio';
        const { bio } = await req.json();
        if (!bio || typeof bio !== 'string' || bio.trim().length === 0) return NextResponse.json({ error: 'Bio text is required.' }, { status: 400 });
        if (bio.length > 1000) return NextResponse.json({ error: 'Bio is too long (max 1000 characters).' }, { status: 400 });
        bioText = bio;
        modelName = "gemini-1.5-flash";

    } else if (contentType.includes('multipart/form-data')) {
        inputType = 'image';
        const formData = await req.formData();
        const imageFile = formData.get('image');

        if (!imageFile || !(imageFile instanceof File)) {
            return NextResponse.json({ error: 'Image file is required and must be a file.' }, { status: 400 });
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (imageFile.size > maxSize) {
           return NextResponse.json({ error: `Image file too large (Max ${maxSize / 1024 / 1024}MB).` }, { status: 413 });
        }

        const mimeType = imageFile.type;
        if (!mimeType.startsWith('image/')) {
             return NextResponse.json({ error: 'Invalid file type. Only images allowed.' }, { status: 400 });
        }

        const imageBuffer = await imageFile.arrayBuffer();
        const imageBase64 = bufferToBase64(imageBuffer);
        imagePart = { inlineData: { mimeType: mimeType, data: imageBase64 } };
        modelName = "gemini-1.5-pro-latest";

    } else {
        return NextResponse.json({ error: 'Unsupported Content-Type.' }, { status: 415 });
    }

    const harshnessLevel = dbUser?.harshnessLevel || 'Standard Snark';
    const commonInstructions = `You are RoastMe.ai, a witty AI comedian specializing in lighthearted, observational roasts.

    **Harshness Level:** ${harshnessLevel}. Adjust roast intensity accordingly ("Gentle Tease" is light, "Standard Snark" is playful, "Brutal Honesty" is sharper, "Inferno Mode" is savage but fair).

    **Rules:**
    - Generate a short, funny roast (9-11 sentences).
    - Be clever and observational ONLY about the provided ${inputType}. Do not invent details about the user.
    - ABSOLUTELY NO roasting on sensitive topics: appearance (unless clearly intended humorously in ${inputType}), race, religion, gender identity, serious disabilities, politics, tragedies, illegal acts, promoting harm. Stay safe and appropriate.
    - Match the requested Harshness Level in tone and directness.
    - Output only the roast text. No greetings, sign-offs, apologies, or explanations.

    **Roast the user based ONLY on the following ${inputType}:**
    `;

    let roastPrompt: string | Part[];
    if (bioText) {
        roastPrompt = `${commonInstructions}\n"${bioText}"\n\n**Roast Output:**`;
    } else if (imagePart) {
        roastPrompt = [ { text: commonInstructions }, imagePart, { text: "\n**Roast Output:**" } ];
    } else {
         throw new Error("Internal error: Failed to prepare prompt data.");
    }

    const model = genAI.getGenerativeModel({
        model: modelName,
        safetySettings: safetySettings,
        generationConfig: { maxOutputTokens: 150 }
     });

    const result = await model.generateContent(roastPrompt);
    const response = result.response;

    if (!response || !response.text()) {
        const finishReason = response?.candidates?.[0]?.finishReason;
        const promptFeedback = response?.promptFeedback;
        console.warn("Gemini response blocked or empty. Reason:", finishReason, "Feedback:", promptFeedback);
        const defaultError = `Roast failed: The AI couldn't generate a roast for this ${inputType}. Try different input.`;
        let errorMessage = defaultError;
        if (finishReason === 'SAFETY' || promptFeedback?.blockReason) {
             errorMessage = `Roast blocked: Input or potential output violated safety policies.`;
             return NextResponse.json({ error: errorMessage }, { status: 400 });
        } else if (finishReason === 'RECITATION') {
             errorMessage = `Roast blocked: Output limited due to potential recitation issues.`;
             return NextResponse.json({ error: errorMessage }, { status: 400 });
        }
        return NextResponse.json({ error: defaultError }, { status: 500 });
    }

    const roastText = response.text();

    try {
      const updatedUser = await User.findOneAndUpdate(
        { clerkId: userId },
        { $inc: { tokens: -1 } },
        { new: true }
      );
      if (updatedUser) {
          console.log(`Token decremented for user ${userId}. New count: ${updatedUser.tokens}`);
      } else {
           console.error(`Failed to decrement token for user ${userId} after successful roast.`);
      }
    } catch (error) {
        console.error(`Error decrementing token for user ${userId}:`, error);
    }

    return NextResponse.json({ roast: roastText });

  } catch (error: any) {
    console.error(`Error in /api/roast route (${contentType}):`, error);
    if (error.message && error.message.includes('API key not valid')) {
         return NextResponse.json({ error: "AI Service Error: Invalid API Key configuration." }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error processing roast request.', details: error.message }, { status: 500 });
  }
}