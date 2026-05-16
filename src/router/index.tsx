import { createBrowserRouter } from 'react-router-dom';
import About from '@/pages/about';
import ChatPage from '@/pages/chat';
import HomePage from '@/pages/home';
import LoginPage from '@/pages/login';
import ProtectedRoute from '@/router/ProtectedRoute';
import RootLayout from '@/router/RootLayout';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/about', element: <About /> },
          { path: '/chat', element: <ChatPage /> },
        ],
      },
    ],
  },
]);

export default router;
