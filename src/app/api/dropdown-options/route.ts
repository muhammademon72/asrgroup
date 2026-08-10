import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET all dropdown options (optionally filtered by type)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const type = url.searchParams.get('type')

    const where = type ? { type } : {}
    const options = await db.dropdownOption.findMany({
      where,
      orderBy: { value: 'asc' },
    })
    return NextResponse.json(options)
  } catch (error) {
    console.error('Error fetching dropdown options:', error)
    return NextResponse.json({ error: 'Failed to fetch options' }, { status: 500 })
  }
}

// POST create new dropdown option
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, value } = body

    if (!type || !value || !value.trim()) {
      return NextResponse.json({ error: 'Type and value are required' }, { status: 400 })
    }

    // Check for duplicate
    const existing = await db.dropdownOption.findFirst({
      where: { type, value: value.trim() },
    })
    if (existing) {
      return NextResponse.json({ error: 'This option already exists' }, { status: 409 })
    }

    const option = await db.dropdownOption.create({
      data: { type, value: value.trim() },
    })
    return NextResponse.json(option, { status: 201 })
  } catch (error) {
    console.error('Error creating dropdown option:', error)
    return NextResponse.json({ error: 'Failed to create option' }, { status: 500 })
  }
}
