
import Link from 'next/link';
import LogoIcon from '@/components/icons/logo-icon';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
        {/* El SidebarTrigger es principalmente para móvil cuando el sidebar es un overlay. 
            En desktop, con collapsible="icon", el sidebar se encoge.
            Podemos mostrarlo siempre o md:hidden si el sidebar tiene su propio rail/botón de colapso visible en desktop.
        */}
        <SidebarTrigger className="mr-2" /> 
        
        {/* El título del header puede ser opcional si ya está en la sidebar, o puede ser dinámico */}
        <div className="flex-1">
           {/* Podríamos poner aquí breadcrumbs o el título de la página actual si es necesario */}
        </div>

        {/* Elementos adicionales del header a la derecha si son necesarios */}
        {/* Ejemplo: UserMenu, Notifications, etc. */}
      </div>
    </header>
  );
}
