import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Utilise l'URL de la requete comme base pour la redirection (fiable en local et en prod)
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.search = '';

  return NextResponse.redirect(url);
}
