import mongoose, { Schema, Document, Model } from "mongoose";

export interface IComment {
  user: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface ILocation {
  name: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ITravelPost extends Document {
  title: string;
  description: string;
  images: string[];
  tags: string[];
  location: ILocation;
  createdBy: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const createTravelPostSchema: Schema<ITravelPost> = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    location: {
      name: {
        type: String,
        required: true,
      },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const TravelPost: Model<ITravelPost> =
  mongoose.models.TravelPost ||
  mongoose.model<ITravelPost>("TravelPost", createTravelPostSchema);

export default TravelPost;