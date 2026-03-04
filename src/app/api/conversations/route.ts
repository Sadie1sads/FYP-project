import { connect } from '@/dbConnection/dbConnection'
import Message from '@/models/Message'
import User from '@/models/userModel'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

connect()

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as { id: string }
        const currentUserId = decoded.id

        // Find all messages involving this user
        const messages = await Message.find({
            roomId: { $regex: currentUserId }
        })
        .sort({ createdAt: -1 })
        .lean()

        // Get unique room IDs
        const roomIds = [...new Set(messages.map((m) => m.roomId))]

        const conversations = await Promise.all(
            roomIds.map(async (roomId) => {
                const otherUserId = roomId.split('_').find((id) => id !== currentUserId)
                if (!otherUserId) return null

                const otherUser = await User.findById(otherUserId).select('username').lean()
                if (!otherUser) return null

                const latest = messages.find((m) => m.roomId === roomId)

                return {
                    roomId,
                    otherUserId,
                    otherUsername: otherUser.username,
                    latestMessage: latest?.text || '',
                    latestMessageTime: latest?.createdAt || null,
                }
            })
        )

        return NextResponse.json({
            success: true,
            conversations: conversations.filter(Boolean)
        })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch conversations'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}