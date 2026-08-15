import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Prevent Next.js from caching this route in production
export const dynamic = 'force-dynamic'

// Simple hash function (for production, use bcrypt)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await db.user.findFirst({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (user.status !== "Active") {
      return NextResponse.json({ error: "Account is " + user.status.toLowerCase() + ". Contact administrator." }, { status: 403 });
    }

    const hashedPassword = user.password || simpleHash("123456");
    const inputHashed = simpleHash(password);

    if (hashedPassword !== inputHashed && user.password !== password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Return user info (without password)
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({
      user: userWithoutPassword,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
