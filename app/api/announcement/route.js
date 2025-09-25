import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { ApiResponse, withErrorHandling, getPaginationParams, validateRequest, logApiCall } from "../../lib/api-utils";

const prisma = new PrismaClient();

export const GET = withErrorHandling(async (req) => {
  const startTime = Date.now();
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return ApiResponse.unauthorized('Authentication required');
  }

  const url = new URL(req.url);
  const { page, pageSize, offset } = getPaginationParams(url.searchParams);
  const search = url.searchParams.get('search') || '';

  const where = search ? {
    OR: [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } }
    ]
  } : {};

  const [items, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: pageSize,
      include: {
        user: { select: { name: true, email: true } }
      }
    }),
    prisma.announcement.count({ where })
  ]);

  const response = ApiResponse.success({
    items,
    pagination: {
      page,
      pageSize,
      total,
      pages: Math.ceil(total / pageSize)
    }
  }, 'Announcements retrieved successfully');

  // Add caching headers
  response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
  
  logApiCall('/api/announcement', 'GET', session.user.id, Date.now() - startTime, 200);
  return response;
});

export const POST = withErrorHandling(async (req) => {
  const startTime = Date.now();
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return ApiResponse.unauthorized('Authentication required');
  }

  if (!['ADMIN', 'GCC', 'DCC'].includes(session.user.role)) {
    return ApiResponse.forbidden('Insufficient permissions to create announcements');
  }

  const form = await req.formData();
  const data = Object.fromEntries(form.entries());

  // Validate required fields
  const validationErrors = validateRequest(data, {
    title: { required: true, minLength: 3, maxLength: 200 },
    content: { required: true, minLength: 10, maxLength: 5000 },
    type: { required: true }
  });

  if (validationErrors.length > 0) {
    return ApiResponse.validationError(validationErrors);
  }

  const announcement = await prisma.announcement.create({
    data: {
      ...data,
      userId: session.user.id,
      districtId: session.user.districtId,
      agencyId: session.user.agencyId
    }
  });

  logApiCall('/api/announcement', 'POST', session.user.id, Date.now() - startTime, 201);
  return ApiResponse.success(announcement, 'Announcement created successfully', 201);
});
