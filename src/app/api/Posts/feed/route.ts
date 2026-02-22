import { connect } from '@/dbConnection/dbConnection'
import TravelPost from '@/models/createTravelPost'
import { NextRequest, NextResponse } from 'next/server'

connect()

export async function GET(request: NextRequest) {
    try {
        const posts = await TravelPost.find()
            .sort({ createdAt: -1 })
            .populate('createdBy', 'username')
            .populate('comments.user', 'username')
            .lean()

        return NextResponse.json({
            success: true,
            posts,
        })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch posts'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
