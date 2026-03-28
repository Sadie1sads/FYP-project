import { connect } from '@/dbConnection/dbConnection'
import User from '@/models/userModel'
import TravelPost from '@/models/createTravelPost'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

connect()

async function verifyAdmin(request: NextRequest) {
    const token = request.cookies.get('token')?.value
    if (!token) throw new Error('No token')
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as { id: string }
    const user = await User.findById(decoded.id).select('isAdmin')
    if (!user?.isAdmin) throw new Error('Not admin')
}

export async function GET(request: NextRequest) {
    try {
        await connect()
        await verifyAdmin(request)

        const [totalUsers, totalPosts, verifiedUsers, recentUsers] = await Promise.all([
            User.countDocuments(),
            TravelPost.countDocuments(),
            User.countDocuments({ isVerified: true }),
            User.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select('username email createdAt isVerified')
                .lean(),
        ])

        return NextResponse.json({
            success: true,
            stats: {
                totalUsers,
                totalPosts,
                verifiedUsers,
                unverifiedUsers: totalUsers - verifiedUsers,
                recentUsers,
                
            }
        })
    } catch (error: any) {
        const status = error.message === 'Not admin' ? 403 : 500
        return NextResponse.json({ error: error.message }, { status })
    }
}