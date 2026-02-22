import { connect } from '@/dbConnection/dbConnection'
import Notification from '@/models/notificationModel'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

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

        const notifications = await Notification.find({ userId: decoded.id })
            .sort({ createdAt: -1 })
            .populate('postId', 'title location')
            .lean()

        return NextResponse.json({
            success: true,
            notifications,
        })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch notifications'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
