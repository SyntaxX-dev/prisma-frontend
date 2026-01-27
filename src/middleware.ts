import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/forgot-password',
  '/auth/reset-password', // Inclui todas as sub-rotas: /verify-code, /new-password
  '/checkout', // Checkout é público - usuários pagam ANTES de criar conta
  '/plans', // Página de seleção de planos
];

// Rotas de autenticação (se já estiver logado, redireciona para dashboard)
const AUTH_ROUTES = [
  '/auth/login',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { searchParams } = request.nextUrl;

  // Verifica se há um token na query string para setar o cookie (após login)
  const tokenFromQuery = searchParams.get('auth_token');
  const shouldSetCookie = searchParams.get('set_cookie') === 'true';

  // Se há token na query e flag para setar cookie, seta o cookie e redireciona
  if (tokenFromQuery && shouldSetCookie) {
    const response = NextResponse.redirect(new URL(pathname, request.url));
    
    // Remove os query params da URL
    const cleanUrl = new URL(pathname, request.url);
    
    // Seta o cookie com configurações apropriadas
    const isSecure = request.nextUrl.protocol === 'https:';
    const expiresIn = 7 * 24 * 60 * 60; // 7 dias em segundos
    
    response.cookies.set('auth_token', tokenFromQuery, {
      path: '/',
      maxAge: expiresIn,
      sameSite: 'lax',
      secure: isSecure,
      httpOnly: false, // Precisa ser false para o cliente poder ler
    });

    // Redireciona para a URL limpa (sem query params)
    return NextResponse.redirect(cleanUrl);
  }

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
  // Permite rotas exatas ou rotas que começam com rotas públicas (para sub-rotas)
  const isPublicRoute = PUBLIC_ROUTES.some((route) => 
    pathname === route || 
    pathname.startsWith(route + '/') || 
    pathname.startsWith('/api')
  );

  // Bloqueia acesso à rota de registro - redireciona para home
  if (pathname.startsWith('/auth/register')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Verifica se é uma rota de autenticação
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Se é rota de autenticação e o usuário já está logado, redireciona para dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Se é rota protegida e o usuário não está logado, redireciona para LOGIN
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
