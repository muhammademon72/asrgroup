import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// PUT update dropdown option
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { value } = body

    if (!value || !value.trim()) {
      return NextResponse.json({ error: 'Value is required' }, { status: 400 })
    }

    const option = await db.dropdownOption.update({
      where: { id },
      data: { value: value.trim() },
    })
    return NextResponse.json(option)
  } catch (error) {
    console.error('Error updating dropdown option:', error)
    return NextResponse.json({ error: 'Failed to update option' }, { status: 500 })
  }
}

// DELETE dropdown option
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.dropdownOption.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting dropdown option:', error)
    return NextResponse.json({ error: 'Failed to delete option' }, { status: 500 })
  }
}
