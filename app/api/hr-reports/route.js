import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '../../../lib/auth';

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

    const { title, description, reportType, dateRange, filters, format } =
      await req.json();

    // Validate required fields
    if (!title || !description || !reportType || !dateRange || !format) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Create HR report
    const report = await prisma.hrReport.create({
      data: {
        title,
        description,
        reportType,
        startDate: new Date(dateRange.start),
        endDate: new Date(dateRange.end),
        filters: filters || {},
        format,
        status: 'PROCESSING',
        createdBy: session.user.id,
        createdAt: new Date()
      }
    });

    // Generate report data
    const reportData = await generateHRReportData(
      reportType,
      dateRange,
      filters
    );

    // Update report with generated data
    await prisma.hrReport.update({
      where: { id: report.id },
      data: {
        status: 'COMPLETED',
        data: reportData,
        completedAt: new Date()
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'HR_REPORT_GENERATED',
        entityType: 'HR_REPORT',
        entityId: report.id,
        userId: session.user.id,
        details: {
          title,
          reportType,
          format,
          dateRange
        }
      }
    });

    return NextResponse.json({
      success: true,
      report,
      message: 'HR report generated successfully'
    });
  } catch (error) {
    // console.error('Generate HR report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate HR report' },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const _session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const _reports = await prisma.hrReport.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { name: true, email: true } }
      }
    });

    return NextResponse.json({ reports });
  } catch (error) {
    // console.error('Get HR reports error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch HR reports' },
      { status: 500 }
    );
  }
}

async function generateHRReportData(reportType, dateRange, filters) {
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);

  switch (reportType) {
  case 'STAFF_ATTENDANCE':
    return await generateStaffAttendanceReport(startDate, endDate, filters);
  case 'LEAVE_SUMMARY':
    return await generateLeaveSummaryReport(startDate, endDate, filters);
  case 'PERFORMANCE_REVIEW':
    return await generatePerformanceReviewReport(startDate, endDate, filters);
  case 'PAYROLL_SUMMARY':
    return await generatePayrollSummaryReport(startDate, endDate, filters);
  case 'TRAINING_RECORDS':
    return await generateTrainingRecordsReport(startDate, endDate, filters);
  case 'DISCIPLINARY_ACTIONS':
    return await generateDisciplinaryActionsReport(
      startDate,
      endDate,
      filters
    );
  case 'RECRUITMENT_STATUS':
    return await generateRecruitmentStatusReport(startDate, endDate, filters);
  case 'STAFF_TURNOVER':
    return await generateStaffTurnoverReport(startDate, endDate, filters);
  default:
    return { message: 'Report type not supported' };
  }
}

async function generateStaffAttendanceReport(startDate, endDate, filters) {
  // Mock data - in production, this would query actual attendance records
  return {
    summary: {
      totalStaff: 45,
      averageAttendance: 95.2,
      totalWorkingDays: 22,
      totalAbsentDays: 12
    },
    staffAttendance: [
      {
        name: 'John Doe',
        department: 'Ministry',
        attendance: 98.5,
        absentDays: 0
      },
      {
        name: 'Jane Smith',
        department: 'Administration',
        attendance: 92.3,
        absentDays: 1
      },
      {
        name: 'Mike Johnson',
        department: 'Finance',
        attendance: 100,
        absentDays: 0
      }
      // ... more staff records
    ],
    trends: {
      monthly: [
        { month: 'January', attendance: 94.5 },
        { month: 'February', attendance: 95.2 },
        { month: 'March', attendance: 96.1 }
      ]
    }
  };
}

async function generateLeaveSummaryReport(startDate, endDate, filters) {
  return {
    summary: {
      totalLeaveRequests: 25,
      approved: 20,
      pending: 3,
      rejected: 2
    },
    leaveTypes: [
      {
        type: 'Annual Leave',
        requested: 15,
        approved: 12,
        pending: 2,
        rejected: 1
      },
      {
        type: 'Sick Leave',
        requested: 8,
        approved: 7,
        pending: 1,
        rejected: 0
      },
      {
        type: 'Personal Leave',
        requested: 2,
        approved: 1,
        pending: 0,
        rejected: 1
      }
    ],
    staffLeave: [
      {
        name: 'John Doe',
        leaveType: 'Annual Leave',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        status: 'Approved'
      },
      {
        name: 'Jane Smith',
        leaveType: 'Sick Leave',
        startDate: '2024-01-10',
        endDate: '2024-01-12',
        status: 'Approved'
      }
    ]
  };
}

async function generatePerformanceReviewReport(startDate, endDate, filters) {
  return {
    summary: {
      totalReviews: 15,
      averageRating: 4.2,
      excellent: 5,
      good: 8,
      satisfactory: 2,
      needsImprovement: 0
    },
    reviews: [
      {
        name: 'John Doe',
        department: 'Ministry',
        rating: 4.5,
        reviewDate: '2024-01-15',
        status: 'Completed'
      },
      {
        name: 'Jane Smith',
        department: 'Administration',
        rating: 4.0,
        reviewDate: '2024-01-20',
        status: 'Completed'
      }
    ]
  };
}

async function generatePayrollSummaryReport(startDate, endDate, filters) {
  return {
    summary: {
      totalStaff: 45,
      totalGrossPay: 125000,
      totalDeductions: 15000,
      totalNetPay: 110000
    },
    payroll: [
      {
        name: 'John Doe',
        position: 'Pastor',
        grossPay: 5000,
        deductions: 600,
        netPay: 4400
      },
      {
        name: 'Jane Smith',
        position: 'Administrator',
        grossPay: 3500,
        deductions: 420,
        netPay: 3080
      }
    ]
  };
}

async function generateTrainingRecordsReport(startDate, endDate, filters) {
  return {
    summary: {
      totalTrainingSessions: 12,
      totalParticipants: 180,
      completionRate: 95.5
    },
    trainings: [
      {
        title: 'Leadership Development',
        date: '2024-01-15',
        participants: 25,
        status: 'Completed'
      },
      {
        title: 'Financial Management',
        date: '2024-01-20',
        participants: 30,
        status: 'Completed'
      }
    ]
  };
}

async function generateDisciplinaryActionsReport(startDate, endDate, filters) {
  return {
    summary: {
      totalActions: 3,
      warnings: 2,
      suspensions: 1,
      terminations: 0
    },
    actions: [
      {
        name: 'John Doe',
        action: 'Verbal Warning',
        date: '2024-01-10',
        reason: 'Late arrival'
      },
      {
        name: 'Jane Smith',
        action: 'Written Warning',
        date: '2024-01-15',
        reason: 'Inappropriate behavior'
      }
    ]
  };
}

async function generateRecruitmentStatusReport(startDate, endDate, filters) {
  return {
    summary: {
      totalPositions: 8,
      filled: 5,
      open: 2,
      inProgress: 1
    },
    positions: [
      {
        title: 'Youth Pastor',
        status: 'Filled',
        postedDate: '2024-01-01',
        filledDate: '2024-01-20'
      },
      {
        title: 'Administrative Assistant',
        status: 'Open',
        postedDate: '2024-01-15',
        filledDate: null
      }
    ]
  };
}

async function generateStaffTurnoverReport(startDate, endDate, filters) {
  return {
    summary: {
      totalHires: 8,
      totalDepartures: 3,
      turnoverRate: 6.7
    },
    hires: [
      {
        name: 'John Doe',
        position: 'Pastor',
        hireDate: '2024-01-15',
        department: 'Ministry'
      },
      {
        name: 'Jane Smith',
        position: 'Administrator',
        hireDate: '2024-01-20',
        department: 'Administration'
      }
    ],
    departures: [
      {
        name: 'Mike Johnson',
        position: 'Youth Pastor',
        departureDate: '2024-01-10',
        reason: 'Resignation'
      }
    ]
  };
}
