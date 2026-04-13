import { connect } from '@/dbConnection/dbConnection'
import TravelPost from '@/models/createTravelPost'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

connect()

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    try {
        const { postId } = await params
        const post = await TravelPost.findById(postId)
            .populate('createdBy', 'username _id')
            .populate('comments.user', 'username')
            .lean()
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }
        return NextResponse.json({ success: true, post })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch post'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    try {
        const token = request.cookies.get('token')?.value
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const decoded: { id: string; role: string } = jwt.verify(
            token,
            process.env.TOKEN_SECRET!
        ) as { id: string; role: string }

        const { postId } = await params
        const post = await TravelPost.findById(postId)
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        const isOwner = String(post.createdBy) === decoded.id
        const isAdmin = decoded.role === 'admin'

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        await TravelPost.findByIdAndDelete(postId)
        return NextResponse.json({ success: true, message: 'Post deleted' })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to delete post'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    try {
        const token = request.cookies.get('token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: { id: string } = jwt.verify(token, process.env.TOKEN_SECRET!) as { id: string }
        const { postId } = await params
        const post = await TravelPost.findById(postId)

        if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        if (String(post.createdBy) !== decoded.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

        const body = await request.json()
        const updated = await TravelPost.findByIdAndUpdate(postId, body, { new: true })
        return NextResponse.json({ success: true, post: updated })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to update post'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}