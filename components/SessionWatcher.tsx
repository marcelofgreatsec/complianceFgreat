'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';


export function SessionWatcher() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (pathname === '/login') return;

        let timeoutId: NodeJS.Timeout;
        const supabase = createClient();


        const logoutUser = async () => {
            await supabase.auth.signOut();
            router.push('/login');
        };

        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(logoutUser, 15 * 60 * 1000); // 15 mins
        };

        const events = ['mousemove', 'keydown', 'wheel', 'mousedown', 'touchstart'];
        events.forEach(e => window.addEventListener(e, resetTimer));

        resetTimer();

        return () => {
            clearTimeout(timeoutId);
            events.forEach(e => window.removeEventListener(e, resetTimer));
        };
    }, [pathname, router]);

    return null;
}
