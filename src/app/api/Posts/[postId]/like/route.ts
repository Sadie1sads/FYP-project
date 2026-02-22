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
        const post = await TravelPost.findById(postId)
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        const userId = decoded.id
        const likeIdx = post.likes?.findIndex((id: unknown) => String(id) === userId) ?? -1

        if (likeIdx >= 0) {
            post.likes?.splice(likeIdx, 1)
        } else {
            if (!post.likes) post.likes = []
            post.likes.push(userId)
        }
        await post.save()

        return NextResponse.json({
            success: true,
            likes: post.likes?.length ?? 0,
            liked: !(likeIdx >= 0),
        })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to like'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
