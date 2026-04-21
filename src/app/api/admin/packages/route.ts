import { connect } from '@/dbConnection/dbConnection'
import TravelPackage from '@/models/travelPackage'
import User from '@/models/userModel'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

connect()

async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  if (!token) throw new Error('No token')
  const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as { id: string }
  const user = await User.findById(decoded.id).select('isAdmin')
  if (!user?.isAdmin) throw new Error('Not admin')
}

export async function GET(request: NextRequest) {
  try {
    await verifyAdmin(request)
    const packages = await TravelPackage.find()
      .sort({ createdAt: -1 })
      .populate('joinedUsers.userId', 'username email')
      .lean()
    return NextResponse.json({ success: true, packages })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await verifyAdmin(request)
    const body = await request.json()
    const { location, description, startDate, endDate, price } = body

    if (!location || !description || !startDate || !endDate || price === undefined || price === null) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    if (end < start) {
      return NextResponse.json({ error: 'End date cannot be before start date' }, { status: 400 })
    }

    if (Number(price) < 0) {
      return NextResponse.json({ error: 'Price cannot be negative' }, { status: 400 })
    }
    
    const newPackage = await TravelPackage.create({
      location, description, startDate, endDate, price,
    })

    return NextResponse.json({ success: true, package: newPackage })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await verifyAdmin(request)
    const { packageId } = await request.json()
    await TravelPackage.findByIdAndDelete(packageId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}