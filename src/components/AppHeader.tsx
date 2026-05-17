import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLogoutMutation } from '@/hooks/useAccount';

const navItems = [
  { to: '/', label: '首页' },
  { to: '/works', label: '作品' },
  { to: '/chat', label: '对话' },
] as const;

export default function AppHeader() {
  const location = useLocation();
  const logoutMutation = useLogoutMutation();

  if (location.pathname === '/login') {
    return null;
  }

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-12 max-w-4xl items-center justify-between gap-4 px-4">
        <nav className="flex items-center gap-1">
          {navItems.map(({ to, label }) => (
            <Button
              key={to}
              variant={location.pathname === to ? 'secondary' : 'ghost'}
              size="sm"
              asChild
            >
              <Link
                to={to}
                className={cn(
                  location.pathname.startsWith('/works') &&
                    to === '/works' &&
                    location.pathname !== to &&
                    'bg-secondary',
                )}
              >
                {label}
              </Link>
            </Button>
          ))}
        </nav>
        <Button
          variant="outline"
          size="sm"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          退出
        </Button>
      </div>
    </header>
  );
}
