import { type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  // Solo interceptamos rutas críticas para performance
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return await updateSession(request)
  }
  return
}

export const config = {
  matcher: ['/admin/:path*'],
}
