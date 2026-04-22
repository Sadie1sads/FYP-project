import { connect } from '@/dbConnection/dbConnection'
import User from '@/models/userModel'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

connect()

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value
        if (!token) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
        }

        const secret = process.env.TOKEN_SECRET!
        const payload = jwt.verify(token, secret) as { id: string }

        const user = await User.findById(payload.id).select('-password').lean()
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                isVerified: user.isVerified,
            }
        })
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Invalid token' }, { status: 401 })
    }
}