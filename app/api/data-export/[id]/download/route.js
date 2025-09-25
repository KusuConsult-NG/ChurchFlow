import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'GCC', 'DCC'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get the export job
    const exportJob = await prisma.dataExport.findUnique({
      where: { id },
      include: { createdBy: { select: { name: true, email: true } } }
    });

    if (!exportJob) {
      return NextResponse.json({ error: 'Export job not found' }, { status: 404 });
    }

    if (exportJob.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Export job not completed yet' }, { status: 400 });
    }

    // In production, you would read the actual file from the file system
    // For now, we'll generate a simple response
    const content = `Data Export - ${exportJob.dataTypes.join(', ')}\nGenerated: ${exportJob.createdAt.toLocaleString()}`;
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': getContentType(exportJob.format),
        'Content-Disposition': `attachment; filename="churchflow-export-${id}.${exportJob.format.toLowerCase()}"`,
      },
    });
  } catch (error) {
    console.error('Download export error:', error);
    return NextResponse.json({ error: 'Failed to download export' }, { status: 500 });
  }
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
