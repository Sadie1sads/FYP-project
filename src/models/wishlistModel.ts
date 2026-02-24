import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWishlist extends Document {
  userId: mongoose.Types.ObjectId;
  locations: string[];
  posts: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const wishlistSchema: Schema<IWishlist> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", 
      required: true,
      unique: true,
    },
    locations: {
      type: [String],
      default: [],
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TravelPost",
      },
    ],
  },
  { timestamps: true }
);

const Wishlist: Model<IWishlist> =
  mongoose.models.Wishlist ||
  mongoose.model<IWishlist>("Wishlist", wishlistSchema);

export default Wishlist;