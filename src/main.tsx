import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { setOnUnauthorized } from '@/api/request';
import { queryClient } from '@/lib/queryClient';
import router from '@/router';
import './index.css';
import App from './App.tsx';

setOnUnauthorized(() => {
  void router.navigate('/login', {
    replace: true,
    state: { from: router.state.location },
  });
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
