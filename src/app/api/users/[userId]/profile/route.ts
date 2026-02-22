import { connect } from '@/dbConnection/dbConnection'
import User from '@/models/userModel'
import TravelPost from '@/models/createTravelPost'
import { NextRequest, NextResponse } from 'next/server'

connect()

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params
        const user = await User.findById(userId).select('-password').lean()
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const posts = await TravelPost.find({ createdBy: userId })
            .sort({ createdAt: -1 })
            .populate('createdBy', 'username')
            .populate('comments.user', 'username')
            .lean()

        return NextResponse.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
            },
            posts,
        })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch profile'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
