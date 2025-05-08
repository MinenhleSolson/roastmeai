// models/User.ts
import mongoose, { Schema, Document, models, Model } from 'mongoose';

// Define the structure of the User document
export interface IUser extends Document {
  clerkId: string;
  email: string;
  tokens: number;
  harshnessLevel?: string; // Optional setting
  // Add other fields as needed, e.g., subscription info, roast history array
}

// Create the Mongoose schema
const UserSchema: Schema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  tokens: { type: Number, default: 5 }, // Give 5 free tokens initially
  harshnessLevel: { type: String, default: 'Standard Snark' },
  // Add timestamps if you want to track creation/update times
  // timestamps: true,
});

// Check if the model already exists before defining it
const User: Model<IUser> = models.User || mongoose.model<IUser>('User', UserSchema);

export default User;