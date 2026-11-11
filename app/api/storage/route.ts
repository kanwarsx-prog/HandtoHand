import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const bucketNames = new Set(['profile-photos', 'offers']);

function storageClient() {
    return new S3Client({ forcePathStyle: true });
}

function publicUrl(bucket: string, key: string) {
    const endpoint = process.env.AWS_ENDPOINT_URL_S3;
    if (!endpoint) throw new Error('Neon Object Storage is not configured');
    return `${endpoint.replace(/\/$/, '')}/${bucket}/${key.split('/').map(encodeURIComponent).join('/')}`;
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file');
    const bucket = String(formData.get('bucket') || '');
    const requestedPath = String(formData.get('path') || '');

    if (!(file instanceof File) || !bucketNames.has(bucket) || !requestedPath) {
        return NextResponse.json({ error: 'Invalid upload' }, { status: 400 });
    }
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Images must be 5MB or smaller' }, { status: 400 });
    }

    const key = `${user.id}/${requestedPath.split('/').pop()}`;
    await storageClient().send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type,
        CacheControl: 'public, max-age=3600',
    }));

    return NextResponse.json({ path: key, publicUrl: publicUrl(bucket, key) });
}

export async function DELETE(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const bucket = String(body.bucket || '');
    const key = String(body.path || '');
    if (!bucketNames.has(bucket) || !key || !key.startsWith(`${user.id}/`)) {
        return NextResponse.json({ error: 'Invalid delete' }, { status: 400 });
    }

    await storageClient().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    return NextResponse.json({ success: true });
}
