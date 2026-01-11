export default function Dashboard() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">${dir^} Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to KiTS Hub ${dir^} System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-6 rounded-lg text-white">
          <div className="text-3xl font-bold mb-2">1,234</div>
          <div className="text-purple-100">Total Records</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-lg text-white">
          <div className="text-3xl font-bold mb-2">567</div>
          <div className="text-blue-100">Active Items</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-700 p-6 rounded-lg text-white">
          <div className="text-3xl font-bold mb-2">89</div>
          <div className="text-green-100">New This Month</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-700 p-6 rounded-lg text-white">
          <div className="text-3xl font-bold mb-2">95.2%</div>
          <div className="text-orange-100">Efficiency</div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="text-sm font-medium text-gray-900">Sample Record 1</p>
              <p className="text-sm text-gray-500">Updated 2 hours ago</p>
            </div>
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
              Active
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="text-sm font-medium text-gray-900">Sample Record 2</p>
              <p className="text-sm text-gray-500">Updated 5 hours ago</p>
            </div>
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
              Pending
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
