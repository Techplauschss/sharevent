import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test R2 environment variables
    const r2Config = {
      accountId: process.env.R2_ACCOUNT_ID ? 'SET' : 'MISSING',
      accessKey: process.env.R2_ACCESS_KEY_ID ? 'SET' : 'MISSING',
      secretKey: process.env.R2_SECRET_ACCESS_KEY ? 'SET' : 'MISSING',
      bucket: process.env.R2_BUCKET_NAME || 'MISSING',
      publicUrl: process.env.R2_PUBLIC_URL || 'MISSING'
    };

    console.log('R2 Configuration Test:', r2Config);

    return NextResponse.json({
      success: true,
      config: r2Config,
      message: 'R2 configuration test completed'
    });
  } catch (error) {
    console.error('Error testing R2 config:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
