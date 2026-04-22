import { connect } from '@/dbConnection/dbConnection'
import Wishlist from '@/models/wishlistModel'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

connect()

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const decoded: { id: string } = jwt.verify(
            token,
            process.env.TOKEN_SECRET!
        ) as { id: string }

        const list = await Wishlist.findOne({
            userId: new mongoose.Types.ObjectId(decoded.id)
        }).lean()

        return NextResponse.json({
            success: true,
            wishlist: {
                locations: list?.locations || [],
                posts: list?.posts || [],
            },
        })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch wishlist'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}