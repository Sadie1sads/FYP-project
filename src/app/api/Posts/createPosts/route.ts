import { connect } from '@/dbConnection/dbConnection'
import TravelPost from '@/models/createTravelPost'
import Wishlist from '@/models/wishlistModel'
import Notification from '@/models/notificationModel'
import { NextRequest, NextResponse } from 'next/server'
import jwt from "jsonwebtoken"

connect()

function cleanLocation(name: string) {
    return String(name || '').trim().toLowerCase()
}

export async function POST(request:NextRequest){
    try{
        //get token from cookies
        const token = request.cookies.get("token")?.value
        
        if (!token){
            return NextResponse.json(
                {error: "Unauthorized: No token found"},
                {status: 401}
            )
        }

        //verify token
        const decodedToken: any = jwt.verify(
            token,
            process.env.TOKEN_SECRET!
        )

        //get request body
        const requestBody = await request.json()
        const {title, description, images, location, tags} = requestBody

        //validation
        if (!title || !description || !location?.name) {
            return NextResponse.json(
                {error: "Title, description, and location are required"},
                {status: 400}
            )
        }

        //create post
        const newPost = await TravelPost.create({
            title,
            description,
            images: images || [],
            tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
            location: {
                name: location.name,
                latitude: location.latitude ?? null,
                longitude: location.longitude ?? null,
            },
            createdBy: decodedToken.id,
        })

        // notify users who have this location in their wishlist
        const wishlists = await Wishlist.find({
        locations: {
            $elemMatch: {
            $regex: new RegExp(`^${location.name.trim()}$`, 'i')
            }
        },
        userId: { $ne: decodedToken.id },
        }).lean()

        //Send notification to those users
        for (const wl of wishlists) {
            await Notification.create({
                userId: wl.userId,
                message: `New post about ${location.name}!`,
                postId: newPost._id,
                locationName: location.name,
            })
        }

        //Response
        return NextResponse.json({
            message: "Post created successfully",
            success: true,
            post: newPost,
        })
    }
    catch(error: any){
        return NextResponse.json({error:error.message},
        {status:500})
    }
}