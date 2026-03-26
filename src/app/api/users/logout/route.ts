import {connect} from '@/dbConnection/dbConnection'
import{ NextRequest, NextResponse  } from 'next/server'

connect()

export async function GET(request:NextRequest){
    try{
        const response = NextResponse.json({
            message: "logout successfully",
            success: true
        })

        response.cookies.set("token", "", {
            httpOnly: true,
            sameSite: "lax",   
            expires: new Date(0),
            path: "/",         
        })

        return response
    }
    catch(error: any){
        return NextResponse.json({error:error.message},
        {status:500})
    }
}