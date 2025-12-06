import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
];

// Rotas de autenticação (se já estiver logado, redireciona para dashboard)
const AUTH_ROUTES = [
  '/auth/login',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pega o token dos cookies
  const token = request.cookies.get('auth_token')?.value;
  const isAuthenticated = !!token;

  // Ignora arquivos estáticos e rotas de API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // arquivos como .ico, .png, etc.
  ) {
    return NextResponse.next();
  }

  // Verifica se é uma rota pública
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith('/api'));

  // Verifica se é uma rota de autenticação
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Se é rota de autenticação e o usuário já está logado, redireciona para dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Se é rota protegida e o usuário não está logado, redireciona para login
  if (!isPublicRoute && !isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url);
    // Adiciona o redirect_to para voltar para a página original após login
    loginUrl.searchParams.set('redirect_to', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
