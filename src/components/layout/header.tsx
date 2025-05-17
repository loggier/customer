import Link from 'next/link';
import LogoIcon from '@/components/icons/logo-icon';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <LogoIcon className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block">
            Customer Insights Viewer
          </span>
        </Link>
        {/* Add navigation or other header items here if needed */}
      </div>
    </header>
  );
}
