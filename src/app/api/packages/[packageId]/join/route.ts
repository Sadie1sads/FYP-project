import { connect } from '@/dbConnection/dbConnection'
import TravelPackage from '@/models/travelPackage'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

connect()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ packageId: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as { id: string }
    const { packageId } = await params
    const body = await request.json()
    const { fullName, address, city, contactNumber } = body

    if (!fullName || !address || !city || !contactNumber) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const pkg = await TravelPackage.findById(packageId)
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 })

    const alreadyJoined = pkg.joinedUsers.some(
      (u) => u.userId.toString() === decoded.id
    )
    if (alreadyJoined) {
      return NextResponse.json({ error: 'Already joined' }, { status: 400 })
    }

    pkg.joinedUsers.push({ userId: decoded.id as any, fullName, address, city, contactNumber })
    await pkg.save()

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}