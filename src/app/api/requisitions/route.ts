import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// Prevent Next.js from caching this route in production
export const dynamic = 'force-dynamic'

// GET all requisitions (optionally filter by createdByEmail)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const createdByEmail = url.searchParams.get('createdByEmail')
    const where: any = {}
    if (createdByEmail) {
      where.createdByEmail = createdByEmail
    }
    const requisitions = await db.requisition.findMany({
      where,
      include: { items: { orderBy: { sl: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(requisitions)
  } catch (error) {
    console.error('Error fetching requisitions:', error)
    return NextResponse.json({ error: 'Failed to fetch requisitions' }, { status: 500 })
  }
}

// POST create new requisition
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, ...requisitionData } = body

    const requisition = await db.requisition.create({
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
        status: requisitionData.status || 'Draft',
        createdByEmail: requisitionData.createdByEmail || '',
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

    return NextResponse.json(requisition, { status: 201 })
  } catch (error) {
    console.error('Error creating requisition:', error)
    return NextResponse.json({ error: 'Failed to create requisition' }, { status: 500 })
  }
}
