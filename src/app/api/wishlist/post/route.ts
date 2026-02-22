import { connect } from '@/dbConnection/dbConnection'
import Wishlist from '@/models/wishlistModel'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

connect()

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const decoded: { id: string } = jwt.verify(
            token,
            process.env.TOKEN_SECRET!
        ) as { id: string }

        const body = await request.json()
        const { postId } = body
        if (!postId) {
            return NextResponse.json(
                { error: 'Post ID is required' },
                { status: 400 }
            )
        }

        let list = await Wishlist.findOne({ userId: decoded.id })
        if (!list) {
            list = await Wishlist.create({
                userId: decoded.id,
                locations: [],
                posts: [postId],
            })
        } else {
            const exists = list.posts.some((p: unknown) => String(p) === postId)
            if (!exists) {
                list.posts.push(postId)
                await list.save()
            }
        }

        return NextResponse.json({
            success: true,
            wishlist: { locations: list.locations, posts: list.posts },
        })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to save post'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const decoded: { id: string } = jwt.verify(
            token,
            process.env.TOKEN_SECRET!
        ) as { id: string }

        const { searchParams } = new URL(request.url)
        const postId = searchParams.get('postId')
        if (!postId) {
            return NextResponse.json(
                { error: 'Post ID is required' },
                { status: 400 }
            )
        }

        const list = await Wishlist.findOne({ userId: decoded.id })
        if (!list) {
            return NextResponse.json({ success: true, wishlist: { locations: [], posts: [] } })
        }

        list.posts = list.posts.filter((p: unknown) => String(p) !== postId)
        await list.save()

        return NextResponse.json({
            success: true,
            wishlist: { locations: list.locations, posts: list.posts },
        })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to remove post'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
