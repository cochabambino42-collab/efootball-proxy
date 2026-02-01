import { NextResponse } from 'next/server';

export async function GET(request) {
  console.log('✅ API debug endpoint hit!');
  
  return NextResponse.json({
    success: true,
    message: '¡API funciona!',
    timestamp: new Date().toISOString(),
    path: request.nextUrl.pathname,
    method: 'GET'
  });
}

export async function POST(request) {
  return NextResponse.json({
    success: true,
    message: '¡API POST funciona!',
    timestamp: new Date().toISOString(),
    method: 'POST'
  });
}
