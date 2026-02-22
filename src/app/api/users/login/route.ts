import {connect} from '@/dbConnection/dbConnection'
import User from '@/models/userModel'
import{ NextRequest, NextResponse  } from 'next/server'
import bcryptjs from 'bcryptjs'
import jwt from "jsonwebtoken"

export async function POST(request:NextRequest){
    try{
        await connect()
        const requestBody = await request.json()
        const {email, password} = requestBody
        //validation
        if (!email || !password) {
            return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
        }

        const user = await User.findOne({email})

        if (!user){
            return NextResponse.json({ message: "User does not exist" }, { status: 400 })
        }

        const validPassword = await bcryptjs.compare(password, user.password)

        if (!validPassword){
            return NextResponse.json({ message: "Invalid email or password" }, { status: 400 })
        }

        //token generation
        const secret = process.env.TOKEN_SECRET
        if (!secret) {
            return NextResponse.json(
                { message: "Server misconfigured: TOKEN_SECRET is missing" },
                { status: 500 }
            )
        }

        const tokenData = {
            id: user._id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin
        }

        const token = await jwt.sign(tokenData, secret, {expiresIn: '1d'})

        const response = NextResponse.json({
            message: "Logged in successfully",
            success: true,
            user: {
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                isVerified: user.isVerified,
            }
        })

        response.cookies.set("token", token, {
            httpOnly: true,
            sameSite: "lax",
        })
        return response
    }
    catch(error: any){
        return NextResponse.json(
            { message: error?.message || "Internal server error" },
            { status: 500 }
        )
    }
}