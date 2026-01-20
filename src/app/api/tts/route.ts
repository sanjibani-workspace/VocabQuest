import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const word = searchParams.get('word');

    if (!word) {
        return new NextResponse('Missing word parameter', { status: 400 });
    }

    try {
        // Use Google Translate TTS (unofficial API)
        // client=gtx is generally reliable for server-side requests
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(word)}&tl=en&client=gtx`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            console.error(`TTS Proxy error: ${response.status} ${response.statusText}`);
            return new NextResponse('Failed to fetch audio from upstream', { status: 502 });
        }

        const audioBuffer = await response.arrayBuffer();

        return new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('TTS Proxy internal error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
