import mongoose from "mongoose";

let listenersAttached = false;

export async function connect() {
    const uri = process.env.MONGO_URL;
    if (!uri) {
        throw new Error("MONGO_URL is not set");
    }

    
    if (mongoose.connection.readyState === 1) return;

    try {
        await mongoose.connect(uri);

        if (!listenersAttached) {
            listenersAttached = true;
            const connection = mongoose.connection;

            connection.on("connected", () => {
                console.log("MongoDB connected");
            });

            connection.on("error", (err) => {
                console.error(
                    "MongoDB connection error (check MONGO_URL / DB status):",
                    err
                );
            });

            connection.on("disconnected", () => {
                console.log("MongoDB disconnected");
            });

            connection.on("reconnected", () => {
                console.log("MongoDB reconnected");
            });
        }
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        throw error;
    }
}