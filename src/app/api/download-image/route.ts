import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    const filename = searchParams.get('filename') || 'image.jpg';
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }
    
    // Validate that it's an R2 URL for security
    if (!imageUrl.includes('pub-0651cfbeddb14d3ba54429ab6510dc49.r2.dev')) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }
    
    // Fetch the image from R2
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Sharevent-Download-Proxy/1.0',
      },
    });
    
    if (!response.ok) {
      console.error('Failed to fetch image from R2:', response.status, response.statusText);
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status });
    }
    
    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Return the image with download headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Download proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
