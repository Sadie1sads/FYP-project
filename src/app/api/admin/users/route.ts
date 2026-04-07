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
        await verifyAdmin(request)
        const users = await User.find().select('-password').sort({ createdAt: -1 }).lean()
        const usersWithPostCount = await Promise.all(
            users.map(async (u) => ({
                ...u,
                postCount: await TravelPost.countDocuments({ createdBy: u._id })
            }))
        )
        return NextResponse.json({ success: true, users: usersWithPostCount })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await verifyAdmin(request)
        const { userId } = await request.json()
        await User.findByIdAndDelete(userId)
        await TravelPost.deleteMany({ createdBy: userId })
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}