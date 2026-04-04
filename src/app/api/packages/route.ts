import { connect } from '@/dbConnection/dbConnection'
import TravelPackage from '@/models/travelPackage'
import { NextResponse } from 'next/server'

connect()

export async function GET() {
  try {
    const packages = await TravelPackage.find()
      .sort({ createdAt: -1 })
      .lean()
    return NextResponse.json({ success: true, packages })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}