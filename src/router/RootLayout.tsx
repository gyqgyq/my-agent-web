import { Outlet } from 'react-router-dom';
import AuthInit from '@/components/AuthInit';

export default function RootLayout() {
  return (
    <AuthInit>
      <Outlet />
    </AuthInit>
  );
}
