import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {

    // console.log("Middleware running on path:", request.nextUrl.pathname);
    const refreshToken = request.cookies.get('refreshToken')?.value;

    const publicPaths = ['/', '/login', '/signup'];
    const isPublicPath = publicPaths.includes(request.nextUrl.pathname);

    if (refreshToken && isPublicPath) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/',
        '/login',
        '/signup'
    ]
};