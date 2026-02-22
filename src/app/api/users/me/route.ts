import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    const secret = process.env.TOKEN_SECRET;
    if (!secret) {
      return NextResponse.json(
        { message: "Server misconfigured: TOKEN_SECRET is missing" },
        { status: 500 }
      );
    }

    const payload = jwt.verify(token, secret) as {
      id: string;
      username: string;
      email: string;
      isAdmin?: boolean;
      isVerified?: boolean;
    };

    return NextResponse.json(
      {
        user: {
          id: payload.id,
          username: payload.username,
          email: payload.email,
          isAdmin: !!payload.isAdmin,
          isVerified: !!payload.isVerified,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Invalid token" },
      { status: 401 }
    );
  }
}

