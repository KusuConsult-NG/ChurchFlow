import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '../../../../lib/auth';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const _session = await getServerSession(authOptions);
    if (
      !session?.user ||
      !['ADMIN', 'GCC', 'DCC'].includes(session.user.role)
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dataTypes, format, dateRange, includeArchived } = await req.json();

    if (!dataTypes || dataTypes.length === 0) {
      return NextResponse.json(
        { error: 'At least one data type must be selected' },
        { status: 400 }
      );
    }

    // Create export job record
    const exportJob = await prisma.dataExport.create({
      data: {
        dataTypes,
        format,
        startDate: new Date(dateRange.start),
        endDate: new Date(dateRange.end),
        includeArchived,
        status: 'PROCESSING',
        createdBy: session.user.id,
        createdAt: new Date()
      }
    });

    // Generate export data
    const exportData = await generateExportData(
      dataTypes,
      dateRange,
      includeArchived
    );

    // Convert to requested format
    const fileContent = await convertToFormat(exportData, format);

    // Update export job
    await prisma.dataExport.update({
      where: { id: exportJob.id },
      data: {
        status: 'COMPLETED',
        filePath: `/exports/${exportJob.id}.${format.toLowerCase()}`,
        completedAt: new Date()
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'DATA_EXPORTED',
        entityType: 'DATA_EXPORT',
        entityId: exportJob.id,
        userId: session.user.id,
        details: {
          dataTypes,
          format,
          dateRange,
          includeArchived
        }
      }
    });

    // Return file as response
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': getContentType(format),
        'Content-Disposition': `attachment; filename="churchflow-export-${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}"`
      }
    });
  } catch (error) {
    // console.error('Export data error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

async function generateExportData(dataTypes, dateRange, includeArchived) {
  const data = {};
  const whereClause = {
    createdAt: {
      gte: new Date(dateRange.start),
      lte: new Date(dateRange.end)
    }
  };

  // Note: archived field doesn't exist in current schema
  // This would need to be added to models if archiving is required

  for (const dataType of dataTypes) {
    switch (dataType) {
    case 'members':
      data.members = await prisma.member.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
      });
      break;
    case 'transactions':
      data.transactions = await prisma.transaction.findMany({
        where: whereClause,
        include: { book: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      });
      break;
    case 'events':
      data.events = await prisma.event.findMany({
        where: whereClause,
        orderBy: { date: 'desc' }
      });
      break;
    case 'attendance':
      data.attendance = await prisma.attendance.findMany({
        where: whereClause,
        include: { event: { select: { title: true } } },
        orderBy: { createdAt: 'desc' }
      });
      break;
    case 'announcements':
      data.announcements = await prisma.announcement.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
      });
      break;
    case 'projects':
      data.projects = await prisma.project.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
      });
      break;
    case 'requisitions':
      data.requisitions = await prisma.requisition.findMany({
        where: whereClause,
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      });
      break;
    case 'accounts':
      data.accounts = await prisma.accountBook.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
      });
      break;
    }
  }

  return data;
}

async function convertToFormat(data, format) {
  switch (format) {
  case 'CSV':
    return convertToCSV(data);
  case 'XLSX':
    return convertToXLSX(data);
  case 'JSON':
    return JSON.stringify(data, null, 2);
  case 'PDF':
    return convertToPDF(data);
  default:
    return JSON.stringify(data, null, 2);
  }
}

function convertToCSV(data) {
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

function convertToXLSX(data) {
  // Simplified XLSX conversion - in production you'd use a library like xlsx
  return convertToCSV(data);
}

function convertToPDF(data) {
  // Simplified PDF conversion - in production you'd use a library like Puppeteer or jsPDF
  return convertToCSV(data);
}

function getContentType(format) {
  switch (format) {
  case 'CSV':
    return 'text/csv';
  case 'XLSX':
    return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  case 'JSON':
    return 'application/json';
  case 'PDF':
    return 'application/pdf';
  default:
    return 'text/plain';
  }
}
