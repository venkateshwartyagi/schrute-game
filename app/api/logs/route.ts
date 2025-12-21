import { NextResponse } from 'next/server';
import { getLogs } from '@/lib/db';

export async function GET() {
    try {
        const logs = getLogs();
        return NextResponse.json({ logs });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }
}
