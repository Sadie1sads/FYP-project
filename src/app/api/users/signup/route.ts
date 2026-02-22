import {connect} from '@/dbConnection/dbConnection'
import User from '@/models/userModel'
import{ NextRequest, NextResponse  } from 'next/server'
import bcryptjs from 'bcryptjs'
import {sendEmail} from '@/helpers/mailHelper'

export async function POST(request:NextRequest) {
    try {
        await connect()
        const requestBody = await request.json()
        const {username, email, password, confirmpassword} = requestBody
        //validation
        if (!username || !email || !password || !confirmpassword){
            return NextResponse.json(
                {message: "All fields are required"},
                {status: 400}
            )
        }

        if (password !== confirmpassword){
            return NextResponse.json(
                {message: "Passwords do not match"},
                {status: 400}
            )
        }

        //user registration
        const existingEmail = await User.findOne({ email })
        if (existingEmail) {
            return NextResponse.json({ message: "Email already exists" }, { status: 400 })
        }

        const existingUsername = await User.findOne({ username })
        if (existingUsername) {
            return NextResponse.json({ message: "Username already exists" }, { status: 400 })
        }

        //hash password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt)

        //save user
        const newUser = new User ({
            username,
            email,
            password: hashedPassword
        })

        const savedUser = await newUser.save()
        console.log(savedUser);

        //send verification email
        try {
            await sendEmail({email, emailType: "VERIFY", userId: savedUser._id})
        } catch (err) {
            // Don't block signup if email fails 
            console.error("Verification email failed:", err)
        }

        return NextResponse.json(
            {
                message: "User registered successfully",
                success: true,
            },
            { status: 201 }
        )

    }
    catch(error: any){
        // Handle Mongo duplicate key errors 
        if (error?.code === 11000) {
            const keyValue = error?.keyValue || {}
            const field = Object.keys(keyValue)[0] || "field"
            const value = keyValue?.[field]
            return NextResponse.json(
                { message: `${field} already exists${value ? `: ${value}` : ""}` },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { message: error?.message || "Internal server error" },
            { status: 500 }
        )
    }
}