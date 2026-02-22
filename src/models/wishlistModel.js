import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
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
    posts: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "TravelPost",
        default: [],
    },
}, { timestamps: true });

const Wishlist = mongoose.models.Wishlist || mongoose.model("Wishlist", wishlistSchema);
export default Wishlist;
