import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Prevent Next.js from caching this route in production
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const role = url.searchParams.get("role") || "";
    const status = url.searchParams.get("status") || "";

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { employeeId: { contains: search } },
        { department: { contains: search } },
      ];
    }
    if (role) where.role = role;
    if (status) where.status = status;

    const users = await db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user = await db.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: body.password || "123456",
        phone: body.phone || "",
        employeeId: body.employeeId || "",
        department: body.department || "",
        branch: body.branch || "",
        role: body.role || "User",
        status: body.status || "Active",
      },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
