import { Outlet } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import AuthInit from '@/components/AuthInit';

export default function RootLayout() {
  return (
    <AuthInit>
      <div className="flex min-h-svh flex-col">
        <AppHeader />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </AuthInit>
  );
}
