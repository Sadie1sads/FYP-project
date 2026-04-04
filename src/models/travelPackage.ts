import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IJoinedUser {
  userId: mongoose.Types.ObjectId
  fullName: string
  address: string
  city: string
  contactNumber: string
}

export interface ITravelPackage extends Document {
  location: string
  description: string
  startDate: Date
  endDate: Date
  price: number
  joinedUsers: IJoinedUser[]
  createdAt: Date
}

const joinedUserSchema = new Schema<IJoinedUser>({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  fullName:      { type: String, required: true },
  address:       { type: String, required: true },
  city:          { type: String, required: true },
  contactNumber: { type: String, required: true },
})

const travelPackageSchema = new Schema<ITravelPackage>(
  {
    location:    { type: String, required: true },
    description: { type: String, required: true },
    startDate:   { type: Date, required: true },
    endDate:     { type: Date, required: true },
    price:       { type: Number, required: true },
    joinedUsers: [joinedUserSchema],
  },
  { timestamps: true }
)

const TravelPackage: Model<ITravelPackage> =
  mongoose.models.TravelPackage ||
  mongoose.model<ITravelPackage>('TravelPackage', travelPackageSchema)

export default TravelPackage