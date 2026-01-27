'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestPage() {
    const [status, setStatus] = useState<'testing' | 'connected' | 'failed'>('testing');
    const [error, setError] = useState<string | null>(null);
    const [envVars, setEnvVars] = useState({
        url: '',
        anonKey: '',
    });

    useEffect(() => {
        // Check environment variables
        setEnvVars({
            url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
            anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET (hidden)' : 'NOT SET',
        });

        // Test connection
        async function testConnection() {
            try {
                const supabase = createClient();

                // Try to query the database
                const { data, error: dbError } = await supabase
                    .from('users')
                    .select('count')
                    .limit(1);

                if (dbError) {
                    setStatus('failed');
                    setError(dbError.message);
                } else {
                    setStatus('connected');
                }
            } catch (e: any) {
                setStatus('failed');
                setError(e.message);
            }
        }

        testConnection();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Supabase Connection Test
                </h1>

                <div className="bg-white rounded-lg shadow p-6 space-y-6">
                    {/* Connection Status */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            Connection Status
                        </h2>
                        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${status === 'connected'
                                ? 'bg-green-100 text-green-800'
                                : status === 'failed'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {status === 'connected' ? '✓ Connected' : status === 'failed' ? '✗ Failed' : '⏳ Testing...'}
                        </div>
                    </div>

                    {/* Environment Variables */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            Environment Variables
                        </h2>
                        <div className="bg-gray-50 rounded p-4 space-y-2 font-mono text-sm">
                            <div>
                                <span className="text-gray-600">NEXT_PUBLIC_SUPABASE_URL:</span>
                                <br />
                                <span className="text-gray-900 break-all">{envVars.url}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                                <br />
                                <span className="text-gray-900">{envVars.anonKey}</span>
                            </div>
                        </div>
                    </div>

                    {/* Error Details */}
                    {error && (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                Error Details
                            </h2>
                            <div className="bg-red-50 border border-red-200 rounded p-4">
                                <p className="text-red-800 text-sm font-mono break-all">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {status === 'connected' && (
                        <div className="bg-green-50 border border-green-200 rounded p-4">
                            <p className="text-green-800">
                                ✓ Successfully connected to Supabase! Your database is ready.
                            </p>
                            <p className="text-green-700 text-sm mt-2">
                                You can now proceed with authentication and other features.
                            </p>
                        </div>
                    )}

                    {/* Manual Setup Instructions */}
                    {status === 'failed' && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-4">
                            <h3 className="font-semibold text-blue-900 mb-2">Manual Setup Required</h3>
                            <p className="text-blue-800 text-sm mb-3">
                                Please verify your <code className="bg-blue-100 px-1 rounded">web/.env.local</code> file:
                            </p>
                            <pre className="bg-blue-900 text-blue-100 p-3 rounded text-xs overflow-x-auto">
                                {`NEXT_PUBLIC_SUPABASE_URL=https://vezbnfgtjpadksammaw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
                            </pre>
                            <p className="text-blue-800 text-sm mt-3">
                                After updating, restart the dev server with <code className="bg-blue-100 px-1 rounded">npm run dev</code>
                            </p>
                        </div>
                    )}

                    {/* Troubleshooting */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            Troubleshooting Steps
                        </h2>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                            <li>Verify <code className="bg-gray-100 px-1 rounded">web/.env.local</code> exists in the web directory</li>
                            <li>Check that NEXT_PUBLIC_SUPABASE_URL matches your Supabase project URL</li>
                            <li>Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is the correct anon key from Supabase</li>
                            <li>Restart the dev server: Stop (Ctrl+C) and run <code className="bg-gray-100 px-1 rounded">npm run dev</code> again</li>
                            <li>Hard refresh browser (Ctrl+Shift+R or Ctrl+F5)</li>
                            <li>Check your Supabase project is active at <a href="https://supabase.com/dashboard" target="_blank" className="text-indigo-600 hover:underline">supabase.com/dashboard</a></li>
                        </ol>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <a
                        href="/"
                        className="text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                        ← Back to home
                    </a>
                </div>
            </div>
        </div>
    );
}
