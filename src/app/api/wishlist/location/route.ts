import { connect } from '@/dbConnection/dbConnection'
import Wishlist from '@/models/wishlistModel'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

connect()

function normalizeLocation(name: string) {
    return name.trim().toLowerCase()
}

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
        const { name } = body
        if (!name?.trim()) {
            return NextResponse.json(
                { error: 'Location name is required' },
                { status: 400 }
            )
        }

        const loc = normalizeLocation(name)
        let list = await Wishlist.findOne({ userId: decoded.id })
        if (!list) {
            list = await Wishlist.create({
                userId: decoded.id,
                locations: [loc],
                posts: [],
            })
        } else {
            if (!list.locations.includes(loc)) {
                list.locations.push(loc)
                await list.save()
            }
        }

        return NextResponse.json({
            success: true,
            wishlist: { locations: list.locations, posts: list.posts },
        })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to add location'
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
        const name = searchParams.get('name')
        if (!name?.trim()) {
            return NextResponse.json(
                { error: 'Location name is required' },
                { status: 400 }
            )
        }

        const loc = normalizeLocation(name)
        const list = await Wishlist.findOne({ userId: decoded.id })
        if (!list) {
            return NextResponse.json({ success: true, wishlist: { locations: [], posts: [] } })
        }

        list.locations = list.locations.filter((l) => l !== loc)
        await list.save()

        return NextResponse.json({
            success: true,
            wishlist: { locations: list.locations, posts: list.posts },
        })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to remove location'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
