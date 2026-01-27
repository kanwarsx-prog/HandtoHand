import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { deleteOffer } from '../actions';
import { redirect } from 'next/navigation';

export default async function AdminOffersPage({
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
        .from('offers')
        .select(`
            *,
            user:users!user_id(display_name, email),
            category:categories(name)
        `)
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false });

    if (search) {
        query = query.ilike('title', `%${search}%`);
    }

    const { data: offers } = await query;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="text-gray-500 hover:text-gray-900">← Dashboard</Link>
                        <h1 className="text-3xl font-bold text-gray-900">Offers Management</h1>
                    </div>
                </div>

                <form className="mb-6 flex gap-2">
                    <input
                        name="q"
                        defaultValue={search}
                        placeholder="Search offers by title..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg">Search</button>
                    {search && (
                        <Link href="/admin/offers" className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg flex items-center">
                            Clear
                        </Link>
                    )}
                </form>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Offer</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Author</th>
                                <th className="px-6 py-3">Created</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {offers?.map((offer) => (
                                <tr key={offer.id}>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{offer.title}</div>
                                        {offer.image_url && <span className="text-xs text-indigo-600">Has Image</span>}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {offer.category?.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-900">{offer.user?.display_name}</div>
                                        <div className="text-xs text-gray-500">{offer.user?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(offer.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <form action={async () => {
                                            'use server';
                                            await deleteOffer(offer.id);
                                        }}>
                                            <button className="text-red-600 hover:text-red-800 hover:underline">Delete</button>
                                        </form>
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
