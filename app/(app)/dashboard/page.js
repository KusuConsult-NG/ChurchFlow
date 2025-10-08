import DashboardLayout from '../../../components/DashboardLayout';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to ChurchFlow Dashboard</h1>
            <p className="text-gray-600 mb-6">Your church management system is ready to use!</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Members</h3>
                <p className="text-gray-600">Manage church members</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Events</h3>
                <p className="text-gray-600">Schedule and manage events</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Giving</h3>
                <p className="text-gray-600">Track donations and giving</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}