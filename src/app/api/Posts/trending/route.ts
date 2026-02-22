import { connect } from '@/dbConnection/dbConnection'
import TravelPost from '@/models/createTravelPost'
import { NextRequest, NextResponse } from 'next/server'

connect()

export async function GET(request: NextRequest) {
    try {
        const limit = Math.min(Number(request.nextUrl.searchParams.get('limit')) || 10, 20)

        const trending = await TravelPost.aggregate([
            { $match: { 'location.name': { $exists: true, $ne: '' } } },
            {
                $group: {
                    _id: { $toLower: { $trim: { input: '$location.name' } } },
                    displayName: { $first: '$location.name' },
                    count: { $sum: 1 },
                    postIds: { $push: '$_id' },
                    latitude: { $first: '$location.latitude' },  
                    longitude: { $first: '$location.longitude' }, 
                },
            },
            { $match: { count: { $gt: 0 } } },
            { $sort: { count: -1 } },
            { $limit: limit },
        ])

        const allPostIds = trending.flatMap((t) => t.postIds)
        const posts = await TravelPost.find({ _id: { $in: allPostIds } })
            .sort({ createdAt: -1 })
            .populate('createdBy', 'username')
            .populate('comments.user', 'username')
            .lean()

        const postsById: Record<string, unknown> = {}
        for (const p of posts) {
            postsById[String((p as { _id: unknown })._id)] = p
        }

        const trendingWithPosts = trending.map((t) => ({
            location: t.displayName,
            count: t.count,
            latitude: t.latitude,    
            longitude: t.longitude,  
            posts: t.postIds
                .map((id: { toString: () => string }) => postsById[id.toString()])
                .filter(Boolean),
        }))

        return NextResponse.json({
            success: true,
            trending: trendingWithPosts,
        })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch trending'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}