
'use client'; // Necesario para usePathname y la interactividad de la barra lateral

import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/layout/header';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { List, LogOut, CircleUser } from 'lucide-react';
import LogoIcon from '@/components/icons/logo-icon';


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// export const metadata: Metadata = { // Metadata no se puede usar en client components directamente.
//   title: 'Visor de Perspectivas del Cliente',
//   description: 'Gestiona y visualiza las perspectivas de los clientes.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Alternativa para metadata en client component layout */}
        <title>Visor de Perspectivas del Cliente</title>
        <meta name="description" content="Gestiona y visualiza las perspectivas de los clientes." />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        <SidebarProvider defaultOpen={true}>
          <Sidebar collapsible="icon" className="bg-sidebar text-sidebar-foreground">
            <SidebarHeader className="p-4">
              <Link href="/" className="flex items-center space-x-2">
                <LogoIcon className="h-8 w-8 text-sidebar-primary" />
                <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">Gestión de Clientes</span>
              </Link>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Link href="/" passHref legacyBehavior>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === '/'}
                      tooltip="Ver lista de clientes"
                    >
                      <a>
                        <List className="h-5 w-5" />
                        <span>Lista de Cliente</span>
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="mt-auto">
               <div className="p-3 text-xs text-sidebar-foreground/70 flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
                <CircleUser className="h-5 w-5 flex-shrink-0" />
                <div className="group-data-[collapsible=icon]:hidden">
                    <div>Usuario Ejemplo</div>
                    <div className="text-sidebar-foreground/50">info@ejemplo.com</div>
                </div>
              </div>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Cerrar sesión (simulado)">
                    <LogOut className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">Cerrar Sesión</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
            </div>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
