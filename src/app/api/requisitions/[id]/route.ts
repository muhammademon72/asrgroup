import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET single requisition
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const requisition = await db.requisition.findUnique({
      where: { id },
      include: { items: { orderBy: { sl: 'asc' } } },
    })
    if (!requisition) {
      return NextResponse.json({ error: 'Requisition not found' }, { status: 404 })
    }
    return NextResponse.json(requisition)
  } catch (error) {
    console.error('Error fetching requisition:', error)
    return NextResponse.json({ error: 'Failed to fetch requisition' }, { status: 500 })
  }
}

// PUT update requisition
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { items, ...requisitionData } = body

    // Delete existing items and recreate
    await db.requisitionItem.deleteMany({
      where: { requisitionId: id },
    })

    const requisition = await db.requisition.update({
      where: { id },
      data: {
        date: requisitionData.date,
        organizationName: requisitionData.organizationName,
        department: requisitionData.department,
        address: requisitionData.address,
        applicantName: requisitionData.applicantName,
        applicantDepartment: requisitionData.applicantDepartment,
        employeeId: requisitionData.employeeId,
        branchName: requisitionData.branchName,
        applicantAddress: requisitionData.applicantAddress,
        contact: requisitionData.contact,
        category: requisitionData.category,
        reason: requisitionData.reason,
        totalAmount: requisitionData.totalAmount,
        status: requisitionData.status,
        items: {
          create: items.map((item: { sl: number; equipmentName: string; description: string; qty: number; condition: string; approxPrice: number; selected: boolean }) => ({
            sl: item.sl,
            equipmentName: item.equipmentName,
            description: item.description || '',
            qty: item.qty || 0,
            condition: item.condition || '',
            approxPrice: item.approxPrice || 0,
            selected: item.selected || false,
          })),
        },
      },
      include: { items: true },
    })

    return NextResponse.json(requisition)
  } catch (error) {
    console.error('Error updating requisition:', error)
    return NextResponse.json({ error: 'Failed to update requisition' }, { status: 500 })
  }
}

// DELETE requisition
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.requisition.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting requisition:', error)
    return NextResponse.json({ error: 'Failed to delete requisition' }, { status: 500 })
  }
}
