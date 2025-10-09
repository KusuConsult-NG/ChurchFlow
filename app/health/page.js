import { Suspense } from 'react';

async function HealthCheck() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/debug`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">ChurchFlow Health Check</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium text-gray-900">Environment</h3>
              <p className="text-sm text-gray-600">NODE_ENV: {data.environment?.NODE_ENV || 'Unknown'}</p>
              <p className="text-sm text-gray-600">VERCEL: {data.environment?.VERCEL || 'No'}</p>
              <p className="text-sm text-gray-600">VERCEL_ENV: {data.environment?.VERCEL_ENV || 'Unknown'}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium text-gray-900">Database</h3>
              <p className="text-sm text-gray-600">Status: {data.database?.status || 'Unknown'}</p>
              <p className="text-sm text-gray-600">URL: {data.database?.url || 'Unknown'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Environment Variables</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(data.environmentVariables || {}).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium text-gray-900">{key}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {value ? '✓ Set' : '✗ Missing'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommendations</h2>
          <ul className="space-y-2">
            {(data.recommendations || []).map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Next Steps</h3>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Go to Vercel Dashboard → Settings → Environment Variables</li>
            <li>2. Add all missing environment variables</li>
            <li>3. Redeploy your application</li>
            <li>4. Check this page again to verify the fix</li>
          </ol>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-red-600 mb-6">Health Check Failed</h1>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-4">Error Details</h2>
          <p className="text-red-800 mb-4">{error.message}</p>
          
          <h3 className="font-medium text-red-900 mb-2">Likely Causes:</h3>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• Missing environment variables in Vercel</li>
            <li>• Database connection issues</li>
            <li>• NextAuth configuration problems</li>
            <li>• Build or deployment errors</li>
          </ul>
          
          <div className="mt-4 p-4 bg-white rounded border">
            <h4 className="font-medium text-gray-900 mb-2">Quick Fix:</h4>
            <p className="text-sm text-gray-700">
              Add these environment variables to Vercel Dashboard → Settings → Environment Variables:
            </p>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
              {`DATABASE_URL=postgresql://neondb_owner:npg_OU1J5FlrqZcG@ep-wispy-leaf-adcb35hw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NEXTAUTH_URL=https://church-flow-alpha.vercel.app
NEXTAUTH_SECRET=your-super-secret-nextauth-key-change-this-in-production-123456789
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-123456789
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here`}
            </pre>
          </div>
        </div>
      </div>
    );
  }
}

export default function HealthPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    }>
      <HealthCheck />
    </Suspense>
  );
}

