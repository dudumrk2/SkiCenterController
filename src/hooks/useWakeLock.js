import { useState, useCallback, useEffect } from 'react';

export const useWakeLock = () => {
    const [wakeLock, setWakeLock] = useState(null);
    const [isSupported] = useState('wakeLock' in navigator);
    const [active, setActive] = useState(false);

    const requestWakeLock = useCallback(async () => {
        if (!isSupported) return;
        try {
            const lock = await navigator.wakeLock.request('screen');
            lock.addEventListener('release', () => {
                console.log('Wake Lock Released');
                setWakeLock(null);
                setActive(false);
            });
            console.log('Wake Lock Active');
            setWakeLock(lock);
            setActive(true);
        } catch (err) {
            console.error(`${err.name}, ${err.message}`);
        }
    }, [isSupported]);

    const releaseWakeLock = useCallback(async () => {
        if (wakeLock) {
            await wakeLock.release();
            setWakeLock(null);
            setActive(false);
        }
    }, [wakeLock]);

    const toggleWakeLock = useCallback(() => {
        if (active) {
            releaseWakeLock();
        } else {
            requestWakeLock();
        }
    }, [active, releaseWakeLock, requestWakeLock]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (wakeLock) releaseWakeLock();
        };
    }, [wakeLock, releaseWakeLock]);

    return { isSupported, active, toggleWakeLock };
};
