import { useEffect, useState } from 'react';
import { refreshTokens } from '@/api/modules/account';
import { getRefreshToken, useAuthStore } from '@/store/useAuthStore';

interface AuthInitProps {
  children: React.ReactNode;
}

export default function AuthInit({ children }: AuthInitProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setSession = useAuthStore((s) => s.setSession);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (accessToken) {
        setReady(true);
        return;
      }

      const refresh = getRefreshToken();
      if (!refresh) {
        setReady(true);
        return;
      }

      try {
        const data = await refreshTokens({ refresh_token: refresh });
        if (!cancelled) {
          setSession({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
          });
        }
      } catch {
        if (!cancelled) clearAuth();
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [accessToken, setSession, clearAuth]);

  if (!ready) {
    return (
      <div className="flex min-h-svh items-center justify-center text-muted-foreground">
        加载中…
      </div>
    );
  }

  return children;
}
