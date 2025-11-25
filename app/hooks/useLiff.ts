// app/hooks/useLiff.ts

import { useEffect, useState } from 'react';
import liff from '@line/liff';

export type LiffUser = {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
};

export const useLiff = (liffId: string) => {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<LiffUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId });
        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile();
          setUser(profile);
        }
        setIsReady(true);
      } catch (err) {
        console.error('LIFF init error:', err);
        setError('ไม่สามารถโหลด LIFF ได้');
        setIsReady(true);
      }
    };

    initLiff();
  }, [liffId]);

  return { isReady, user, error, liff };
};