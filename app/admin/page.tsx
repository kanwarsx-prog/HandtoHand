import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { dismissReport, banUser, deleteOffer } from './actions';

// Admin emails (should match actions.ts)
const ADMIN_EMAILS = ['admin@handtohand.com', 'kanwarsx@gmail.com'];

export default async function AdminDashboard() {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-4xl mb-4">🚫</h1>
                    <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
                    <p className="text-gray-500 mb-4">You do not have permission to view this page.</p>
                    <Link href="/" className="text-indigo-600 hover:underline">Return Home</Link>
                </div>
            </div>
        );
    }

    // Use Service Role to fetch all data bypassing RLS
    const adminDb = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { cookies: { getAll: () => [], setAll: () => { } } }
    );

    // Fetch Stats
    const { count: usersCount } = await adminDb.from('users').select('*', { count: 'exact', head: true });
    const { count: offersCount } = await adminDb.from('offers').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE');
    const { count: reportsCount } = await adminDb.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'PENDING');

    // Fetch Pending Reports
    const { data: reports } = await adminDb
        .from('reports')
        .select(`
            *,
            reporter:users!reporter_id(display_name, email)
        `)
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard 🛡️</h1>
                    <Link href="/" className="text-gray-500 hover:text-gray-900">Back to App</Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-gray-500 text-sm font-medium uppercase">Total Users</div>
                        <div className="text-3xl font-bold text-gray-900 mt-2">{usersCount || 0}</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-gray-500 text-sm font-medium uppercase">Active Offers</div>
                        <div className="text-3xl font-bold text-indigo-600 mt-2">{offersCount || 0}</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-gray-500 text-sm font-medium uppercase">Pending Reports</div>
                        <div className="text-3xl font-bold text-red-600 mt-2">{reportsCount || 0}</div>
                    </div>
                </div>

                {/* Reports Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <h2 className="font-bold text-gray-900">Recent Reports</h2>
                    </div>

                    {reports && reports.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Reporter</th>
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3">Reason</th>
                                        <th className="px-6 py-3">Target ID</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {reports.map((report) => (
                                        <tr key={report.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-gray-500">
                                                {new Date(report.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {report.reporter?.display_name}
                                                <div className="text-xs text-gray-400">{report.reporter?.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {report.target_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">
                                                {report.reason}
                                                {report.details && (
                                                    <div className="text-xs text-gray-500 mt-1 italic">"{report.details}"</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                                {report.target_id.substring(0, 8)}...
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <form action={async () => {
                                                        'use server';
                                                        await dismissReport(report.id);
                                                    }}>
                                                        <button className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded text-xs">
                                                            Dismiss
                                                        </button>
                                                    </form>

                                                    {report.target_type === 'OFFER' && (
                                                        <form action={async () => {
                                                            'use server';
                                                            await deleteOffer(report.target_id, report.id);
                                                        }}>
                                                            <button className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-xs border border-red-200">
                                                                Delete Offer
                                                            </button>
                                                        </form>
                                                    )}

                                                    {report.target_type === 'USER' && (
                                                        <form action={async () => {
                                                            'use server';
                                                            await banUser(report.target_id);
                                                            await dismissReport(report.id); // Or mark actioned
                                                        }}>
                                                            <button className="px-3 py-1 text-white bg-red-600 hover:bg-red-700 rounded text-xs shadow-sm">
                                                                Ban User
                                                            </button>
                                                        </form>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-gray-500">
                            No pending reports. All good! 🎉
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
