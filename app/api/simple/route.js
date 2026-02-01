import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: '¡API funcionando!',
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
}
