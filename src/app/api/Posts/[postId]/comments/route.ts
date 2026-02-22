import { connect } from '@/dbConnection/dbConnection'
import TravelPost from '@/models/createTravelPost'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

connect()

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
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

        const { postId } = await params
        const body = await request.json()
        const { text } = body

        if (!text?.trim()) {
            return NextResponse.json(
                { error: 'Comment text is required' },
                { status: 400 }
            )
        }

        const post = await TravelPost.findById(postId)
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        if (!post.comments) post.comments = []
        post.comments.push({
            user: decoded.id,
            text: text.trim(),
        })
        await post.save()

        const updated = await TravelPost.findById(postId)
            .populate('comments.user', 'username')
            .lean()

        return NextResponse.json({
            success: true,
            comments: updated?.comments ?? [],
        })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to comment'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
