import mongoose from "mongoose";

const createTravelPostSchema = new mongoose.Schema({
    title:{
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
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    }],
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
    }],
},
{timestamps: true}
)

const TravelPost = mongoose.models.TravelPost || mongoose.model("TravelPost", createTravelPostSchema)

export default TravelPost