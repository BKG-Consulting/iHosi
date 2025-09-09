import { NextRequest, NextResponse } from 'next/server';

// This is a placeholder for socket connection info
// The actual socket connection happens on the client side
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Socket endpoint - use client-side connection',
    socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000'
  });
}
