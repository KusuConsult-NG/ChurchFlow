import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

export const revalidate = 60;
const prisma = new PrismaClient();

export default async function Events({ searchParams }) {
  const session = await getServerSession(authOptions);
  const page = Math.max(1, Number(searchParams.page || 1));
  const pageSize = Math.max(1, Math.min(50, Number(searchParams.pageSize || 10)));
  const q = (searchParams.q || '').trim();
  const where = q ? { 
    OR: [
      { title: { contains: q, mode: 'insensitive' } }, 
      { location: { contains: q, mode: 'insensitive' } }
    ] 
  } : {};
  
  const [items, total] = await Promise.all([
    prisma.event.findMany({ 
      where, 
      orderBy: { date: 'asc' }, 
      skip: (page - 1) * pageSize, 
      take: pageSize,
      include: { user: { select: { name: true } } }
    }),
    prisma.event.count({ where })
  ]);
  
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        <p className="mt-2 text-gray-600">Manage church events and activities</p>
      </div>

      {/* Search and Actions */}
      <div className="card mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <form method="get" className="flex gap-2">
              <input 
                name="q" 
                defaultValue={q} 
                placeholder="Search events..." 
                className="form-input"
              />
              <button className="btn-primary" type="submit">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
            </form>
          </div>
          <div className="flex gap-2">
            <a href="/admin" className="btn-primary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Event
            </a>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-6">
        {items.length === 0 ? (
          <div className="card text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {q ? 'Try adjusting your search terms.' : 'Get started by creating a new event.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((event) => (
              <div key={event.id} className="card hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
                  </div>
                  <span className={`status-badge ${
                    new Date(event.date) < new Date() ? 'status-completed' :
                    event.type === 'URGENT' ? 'status-rejected' :
                    'status-approved'
                  }`}>
                    {new Date(event.date) < new Date() ? 'Past' : 'Upcoming'}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}
                  </div>
                  
                  {event.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    By {event.user?.name || 'Unknown'}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                      View Details
                    </button>
                    <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                      Edit
                    </button>
                  </div>
                  <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
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
              href={`?q=${encodeURIComponent(q)}&page=${Math.max(1, page - 1)}&pageSize=${pageSize}`}
            >
              Previous
            </a>
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {page} of {pages}
            </span>
            <a 
              className={`btn-secondary text-sm ${page >= pages ? 'opacity-50 pointer-events-none' : ''}`}
              href={`?q=${encodeURIComponent(q)}&page=${Math.min(pages, page + 1)}&pageSize=${pageSize}`}
            >
              Next
            </a>
          </nav>
        </div>
      )}
    </main>
  );
}
