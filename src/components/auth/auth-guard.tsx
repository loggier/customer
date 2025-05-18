
'use client';

import { useSession } from '@/context/session-context';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return; 
    }

    if (!isAuthenticated && pathname !== '/login') {
      router.push('/login');
    } else if (isAuthenticated && pathname === '/login') {
      router.push('/');
    }
  }, [isAuthenticated, pathname, router, isLoading]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verificando sesión...</p>
      </div>
    );
  }

  // Prevent rendering children if a redirect is imminent
  if ((!isAuthenticated && pathname !== '/login') || (isAuthenticated && pathname === '/login')) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Redirigiendo...</p>
        </div>
    );
  }

  return <>{children}</>;
}
