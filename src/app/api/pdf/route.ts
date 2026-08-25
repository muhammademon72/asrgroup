import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');

    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('EQUIPMENT REQUISITION FORM', pageWidth / 2, y + 5, { align: 'center' });
    y += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(data.department || '', pageWidth / 2, y, { align: 'center' });
    y += 8;

    // Left column
    doc.setFontSize(9);
    const leftX = margin;
    const rightX = pageWidth / 2 + 5;
    const colWidth = pageWidth / 2 - margin - 5;

    // Date
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', leftX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(data.date || '', leftX + 15, y);
    y += 6;

    // To
    doc.setFont('helvetica', 'bold');
    doc.text('To,', leftX, y);
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(data.organizationName || '', leftX, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.text(data.department || '', leftX, y);
    y += 4;
    doc.setFontSize(8);
    doc.text(data.address || '', leftX, y);
    doc.setFontSize(9);
    y += 4;

    // Right column - Applicant info
    const applicantInfo = [
      ['Applicant Name', data.applicantName || ''],
      ['Applicant Department', data.applicantDepartment || ''],
      ['Employee ID', data.employeeId || ''],
      ['Branch Name', data.branchName || ''],
      ['Address', data.applicantAddress || ''],
      ['Contact', data.contact || ''],
    ];

    const startYRight = y - 24;
    applicantInfo.forEach((row, i) => {
      const ry = startYRight + (i * 5);
      doc.setFont('helvetica', 'bold');
      doc.text(row[0], rightX, ry);
      doc.setFont('helvetica', 'normal');
      doc.text(row[1], rightX + colWidth - 10, ry, { align: 'right' });
    });

    // Applicant table border
    doc.setDrawColor(150);
    doc.rect(rightX - 1, startYRight - 3, colWidth + 2, 30);
    doc.setDrawColor(200);
    for (let i = 1; i < applicantInfo.length; i++) {
      const ry = startYRight + (i * 5) - 3.5;
      doc.line(rightX - 1, ry, rightX + colWidth + 1, ry);
    }
    doc.line(rightX + colWidth - 10, startYRight - 3, rightX + colWidth - 10, startYRight + 27);

    y += 5;

    // Categories
    const categories = ['Desktop', 'Laptop', 'Network', 'CCTV', 'PC-Update', 'Others Accessories', 'Repairing'];
    const catBoxHeight = 8;
    doc.setDrawColor(180);
    doc.rect(margin, y, contentWidth, catBoxHeight);
    let catX = margin + 3;
    const catSpacing = contentWidth / categories.length;
    categories.forEach((cat) => {
      const isSelected = data.category === cat;
      if (isSelected) {
        // Draw checkbox
        doc.setDrawColor(0);
        doc.rect(catX, y + 2.5, 3, 3);
        doc.line(catX, y + 4, catX + 1.5, y + 5.5);
        doc.line(catX + 1.5, y + 5.5, catX + 3, y + 2.5);
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setDrawColor(100);
        doc.rect(catX, y + 2.5, 3, 3);
        doc.setFont('helvetica', 'normal');
      }
      doc.setFontSize(8);
      doc.text(cat, catX + 4, y + 5);
      catX += catSpacing;
    });
    y += catBoxHeight + 3;

    // Equipment table
    const tableBody = (data.items || []).map((item: any, i: number) => [
      String(item.sl || i + 1),
      item.selected ? '✓' : '',
      item.equipmentName || '',
      item.description || '',
      String(item.qty || '—'),
      item.condition || '—',
      item.approxPrice ? '৳' + item.approxPrice.toLocaleString() : '—',
    ]);

    (doc as any).autoTable({
      startY: y,
      head: [['SL', 'Select', 'EQUIPMENT NAME', 'DESCRIPTION', 'QTY', 'CONDITION', 'APPROX PRICE']],
      body: tableBody,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [150, 150, 150],
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: [230, 230, 230],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 12, halign: 'center' },
        4: { cellWidth: 12, halign: 'center' },
        5: { cellWidth: 18, halign: 'center' },
        6: { cellWidth: 22, halign: 'right' },
      },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.row.raw[1] === '✓') {
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });

    // Get the final Y after table
    y = (doc as any).lastAutoTable.finalY + 5;

    // Total row
    doc.setFillColor(224, 231, 255);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Total Amount:', pageWidth - margin - 35, y + 5, { align: 'right' });
    doc.text('৳' + (data.totalAmount || 0).toLocaleString(), pageWidth - margin, y + 5, { align: 'right' });
    y += 12;

    // Reason section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('PLEASE WRITE A REASON :', margin, y);
    y += 3;
    doc.setDrawColor(180);
    doc.setFillColor(250, 250, 250);
    doc.rect(margin, y, contentWidth, 18, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const reasonLines = doc.splitTextToSize(data.reason || '—', contentWidth - 6);
    doc.text(reasonLines, margin + 3, y + 5);
    y += 25;

    // Signatures
    const sigWidth = contentWidth / 4;
    const sigLabels = ['Applicant', 'Manager / In-Charge', 'Recommend by', 'Authority'];
    sigLabels.forEach((label, i) => {
      const sx = margin + sigWidth * i;
      doc.setDrawColor(100);
      doc.setLineDashPattern([2, 2], 0);
      doc.line(sx + 5, y + 15, sx + sigWidth - 5, y + 15);
      doc.setLineDashPattern([], 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(label, sx + sigWidth / 2, y + 19, { align: 'center' });
    });

    // Return PDF as buffer
    const pdfBuffer = doc.output('arraybuffer');
    const filename = `Requisition_${data.id || 'draft'}_${(data.applicantName || '').replace(/\s+/g, '_')}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
