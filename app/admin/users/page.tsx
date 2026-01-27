import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { banUser, unbanUser } from '../actions';
import { redirect } from 'next/navigation';

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const cookieStore = await cookies();
    const params = await searchParams;
    const search = params.q || '';

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

    // Check is_admin flag
    const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user?.id)
        .single();

    if (!user || !userData?.is_admin) {
        return redirect('/');
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) return <div>Config Error</div>;

    const adminDb = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        { cookies: { getAll: () => [], setAll: () => { } } }
    );

    let query = adminDb
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

    if (search) {
        query = query.or(`display_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: users } = await query;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="text-gray-500 hover:text-gray-900">← Dashboard</Link>
                        <h1 className="text-3xl font-bold text-gray-900">Users Application</h1>
                    </div>
                </div>

                {/* Search */}
                <form className="mb-6 flex gap-2">
                    <input
                        name="q"
                        defaultValue={search}
                        placeholder="Search users..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg">Search</button>
                    {search && (
                        <Link href="/admin/users" className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg flex items-center">
                            Clear
                        </Link>
                    )}
                </form>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Joined</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Admin</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users?.map((u) => (
                                <tr key={u.id}>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{u.display_name}</div>
                                        <div className="text-xs text-gray-500">{u.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(u.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${u.status === 'BANNED' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {u.status || 'ACTIVE'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {u.is_admin ? '✅' : ''}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {u.status === 'BANNED' ? (
                                            <form action={async () => {
                                                'use server';
                                                await unbanUser(u.id);
                                            }}>
                                                <button className="text-green-600 hover:text-green-800 hover:underline">Unban</button>
                                            </form>
                                        ) : (
                                            <form action={async () => {
                                                'use server';
                                                await banUser(u.id);
                                            }}>
                                                <button className="text-red-600 hover:text-red-800 hover:underline">Ban</button>
                                            </form>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
