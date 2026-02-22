import { connect } from '@/dbConnection/dbConnection'
import Notification from '@/models/notificationModel'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

connect()

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.cookies.get('token')?.value
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const decoded: { id: string } = jwt.verify(
            token,
            process.env.TOKEN_SECRET!
        ) as { id: string }

        const { id } = await params
        const notif = await Notification.findOne({ _id: id, userId: decoded.id })
        if (!notif) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        notif.read = true
        await notif.save()

        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to mark read'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
