import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'GCC', 'DCC'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get the HR report
    const report = await prisma.hrReport.findUnique({
      where: { id },
      include: { createdBy: { select: { name: true, email: true } } }
    });

    if (!report) {
      return NextResponse.json({ error: 'HR report not found' }, { status: 404 });
    }

    // Generate the report file based on format
    const fileContent = await generateReportFile(report);
    
    // Update report status
    await prisma.hrReport.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Return file as response
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': getContentType(report.format),
        'Content-Disposition': `attachment; filename="hr-report-${id}.${report.format.toLowerCase()}"`,
      },
    });
  } catch (error) {
    console.error('Generate HR report error:', error);
    return NextResponse.json({ error: 'Failed to generate HR report' }, { status: 500 });
  }
}

async function generateReportFile(report) {
  // This is a simplified version - in production you'd use appropriate libraries
  // to generate PDF, Excel, etc. files based on the report data
  
  const reportData = report.data || {};
  const content = JSON.stringify(reportData, null, 2);
  
  switch (report.format) {
    case 'PDF':
      // In production, use a PDF library like Puppeteer or jsPDF
      return Buffer.from(content);
    case 'EXCEL':
      // In production, use a library like xlsx
      return Buffer.from(content);
    case 'CSV':
      return Buffer.from(convertToCSV(reportData));
    case 'WORD':
      // In production, use a library like docx
      return Buffer.from(content);
    default:
      return Buffer.from(content);
  }
}

function convertToCSV(data) {
  // Simple CSV conversion - in production you'd use a proper CSV library
  const csvRows = [];
  
  for (const [tableName, records] of Object.entries(data)) {
    if (records.length === 0) continue;
    
    csvRows.push(`\n=== ${tableName.toUpperCase()} ===\n`);
    
    // Get headers from first record
    const headers = Object.keys(records[0]);
    csvRows.push(headers.join(','));
    
    // Add data rows
    for (const record of records) {
      const values = headers.map(header => {
        const value = record[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
  }
  
  return csvRows.join('\n');
}

function getContentType(format) {
  switch (format) {
    case 'PDF':
      return 'application/pdf';
    case 'EXCEL':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'CSV':
      return 'text/csv';
    case 'WORD':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    default:
      return 'text/plain';
  }
}
