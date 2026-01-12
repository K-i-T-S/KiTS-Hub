import React from 'react';
import { Settings, Box, AlertCircle } from 'lucide-react';

interface GenericPlaceholderProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  port?: string;
}

const GenericPlaceholder: React.FC<GenericPlaceholderProps> = ({
  title,
  description,
  icon,
  port
}) => {
  return (
    <div className="p-6 bg-white min-h-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>

        {/* Status Card */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-yellow-800 mb-2">
                Service Not Available
              </h3>
              <p className="text-yellow-700 mb-2">
                The micro-frontend service for this module is not currently running.
              </p>
              {port && (
                <p className="text-sm text-yellow-600">
                  Expected service on port: {port}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Placeholder Content */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Module Overview</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <div className="w-12 h-12 text-gray-400 mx-auto mb-4 flex items-center justify-center">
                {icon}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 mb-4">
                This is a placeholder for the {title} module.
              </p>
              <p className="text-sm text-gray-500">
                The full micro-frontend will be available when the remote service is running.
              </p>
              
              {/* Action Buttons */}
              <div className="mt-6 flex justify-center space-x-4">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  <Settings className="w-4 h-4 inline mr-2" />
                  Settings
                </button>
                <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
                  <Box className="w-4 h-4 inline mr-2" />
                  Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericPlaceholder;
