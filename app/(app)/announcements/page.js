import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

export const revalidate = 60;
const prisma = new PrismaClient();
const ALLOWED_SORT = { createdAt: 'createdAt', title: 'title' };

export default async function Announcements({ searchParams }) {
  const session = await getServerSession(authOptions);
  const page = Math.max(1, Number(searchParams.page || 1));
  const pageSize = Math.max(1, Math.min(50, Number(searchParams.pageSize || 10)));
  const q = (searchParams.q || '').trim();
  const sort = ALLOWED_SORT[searchParams.sort] || 'createdAt';
  const dir = (searchParams.dir === 'asc' ? 'asc' : 'desc');
  const where = q ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { content: { contains: q, mode: 'insensitive' } }] } : {};
  
  const [items, total] = await Promise.all([
    prisma.announcement.findMany({ 
      where, 
      orderBy: { [sort]: dir }, 
      skip: (page - 1) * pageSize, 
      take: pageSize,
      include: { user: { select: { name: true } } }
    }),
    prisma.announcement.count({ where })
  ]);
  
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const link = (s, d) => `?q=${encodeURIComponent(q)}&sort=${s}&dir=${d}&page=1&pageSize=${pageSize}`;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
        <p className="mt-2 text-gray-600">Stay updated with the latest church announcements and news</p>
      </div>

      {/* Search and Filter */}
      <div className="card mb-8">
        <form method="get" className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input 
              name="q" 
              defaultValue={q} 
              placeholder="Search announcements..." 
              className="form-input"
            />
          </div>
          <div className="flex gap-2">
            <button className="btn-primary" type="submit">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
            <a href="/admin" className="btn-secondary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Announcement
            </a>
          </div>
        </form>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <a 
            className={`text-sm px-3 py-1 rounded-full transition-colors ${
              sort === 'createdAt' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-blue-600'
            }`}
            href={link('createdAt', dir === 'asc' ? 'desc' : 'asc')}
          >
            Date {sort === 'createdAt' ? (dir === 'asc' ? '↑' : '↓') : ''}
          </a>
          <a 
            className={`text-sm px-3 py-1 rounded-full transition-colors ${
              sort === 'title' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-blue-600'
            }`}
            href={link('title', dir === 'asc' ? 'desc' : 'asc')}
          >
            Title {sort === 'title' ? (dir === 'asc' ? '↑' : '↓') : ''}
          </a>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-6">
        {items.length === 0 ? (
          <div className="card text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No announcements found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {q ? 'Try adjusting your search terms.' : 'Get started by creating a new announcement.'}
            </p>
          </div>
        ) : (
          items.map((announcement) => (
            <div key={announcement.id} className="card hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                    <span className={`status-badge ${
                      announcement.type === 'URGENT' ? 'status-rejected' :
                      announcement.type === 'EVENT' ? 'status-approved' :
                      'status-pending'
                    }`}>
                      {announcement.type}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-3">{announcement.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>By {announcement.user?.name || 'Unknown'}</span>
                    <span>•</span>
                    <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{new Date(announcement.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors" title="Edit">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} results
          </div>
          <nav className="flex items-center gap-2">
            <a 
              className={`btn-secondary text-sm ${page <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
              href={`?q=${encodeURIComponent(q)}&sort=${sort}&dir=${dir}&page=${Math.max(1, page - 1)}&pageSize=${pageSize}`}
            >
              Previous
            </a>
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {page} of {pages}
            </span>
            <a 
              className={`btn-secondary text-sm ${page >= pages ? 'opacity-50 pointer-events-none' : ''}`}
              href={`?q=${encodeURIComponent(q)}&sort=${sort}&dir=${dir}&page=${Math.min(pages, page + 1)}&pageSize=${pageSize}`}
            >
              Next
            </a>
          </nav>
        </div>
      )}
    </main>
  );
}
