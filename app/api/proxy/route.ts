import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { url, method, headers, body } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Prepare headers with default User-Agent to avoid blocking
        const finalHeaders = {
            'User-Agent': 'DevToolkit-Proxy/1.0',
            ...headers
        };

        const options: RequestInit & { duplex?: string } = {
            method: method || 'GET',
            headers: finalHeaders,
        };

        if (body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method!)) {
            options.body = body;
            options.duplex = 'half'; // Required for Node.js fetch with body
        }

        console.log(`[Proxy] Requesting: ${method} ${url}`);

        const startTime = Date.now();
        const response = await fetch(url, options);
        const duration = Date.now() - startTime;

        const responseData = await response.text();
        let data;
        try {
            data = JSON.parse(responseData);
        } catch {
            data = responseData;
        }

        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
            responseHeaders[key] = value;
        });

        return NextResponse.json({
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
            data: data,
            duration: duration,
            size: new Blob([responseData]).size
        });

    } catch (error: any) {
        console.error('[Proxy Error]', error);

        // Provide more context for specific errors
        let errorMessage = error.message || 'An error occurred';
        if (errorMessage === 'terminated') {
            errorMessage = 'Request terminated. This often happens if the target server refused the connection or blocked the request (e.g., missing User-Agent).';
        }

        return NextResponse.json({
            error: errorMessage,
            details: error.cause ? JSON.stringify(error.cause) : undefined,
            status: 500,
            statusText: 'Proxy Error',
            headers: {},
            data: null,
            duration: 0,
            size: 0
        }, { status: 500 });
    }
}
