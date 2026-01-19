import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { useConfig } from '../contexts/ConfigContext';

export const useResortStatus = () => {
    const { config } = useConfig();

    // Initial State derived from config
    const initialLifts = config?.lifts || [];
    const openLiftsCount = initialLifts.filter(l => l.status === 'open').length;

    const [statusData, setStatusData] = useState({
        liftsOpen: openLiftsCount,
        liftsTotal: initialLifts.length,
        weather: 'Cloudy',
        temp: -2,
        nextSnow: 'Tonight (65%)',
        warning: 'No unusual warnings',
        lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        detailedStatus: {} // Store per-id status here
    });

    const [loading, setLoading] = useState(false);

    // Listen to Real-time Firestore Updates
    useEffect(() => {
        const docRef = doc(db, 'artifacts', 'pila-ski-2025', 'public', 'resortStatus');

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setStatusData(prev => ({
                    ...prev,
                    ...data,
                    lastUpdated: data.lastUpdated || prev.lastUpdated
                }));
            }
        });

        return () => unsubscribe();
    }, []);

    const refreshStatus = useCallback(async () => {
        setLoading(true);
        try {
            const docRef = doc(db, 'artifacts', 'pila-ski-2025', 'public', 'resortStatus');

            // Fetch latest first to ensure we base changes on current reality
            // (avoids resetting to defaults on page load race condition)
            const snap = await getDoc(docRef);
            let currentTemp = statusData.temp;

            if (snap.exists()) {
                const data = snap.data();
                if (typeof data.temp === 'number') currentTemp = data.temp;
            }

            const randomTempChange = Math.floor(Math.random() * 3) - 1;
            const newTemp = currentTemp + randomTempChange;

            // Randomly close a lift
            const lifts = config?.lifts || [];
            const detailedStatus = {};
            let closedCount = 0;

            lifts.forEach(lift => {
                const isClosed = Math.random() < 0.1;
                detailedStatus[lift.id] = isClosed ? 'closed' : 'open';
                if (isClosed) closedCount++;
            });

            // Also simulate trail status (assuming config.trails exists)
            const trails = config?.trails || [];
            trails.forEach(trail => {
                // 5% chance to be closed
                const isClosed = Math.random() < 0.05;
                detailedStatus[trail.id] = isClosed ? 'closed' : 'open';
            });

            const openCount = lifts.length - closedCount;

            await setDoc(docRef, {
                liftsOpen: openCount,
                liftsTotal: lifts.length,
                weather: 'Cloudy',
                temp: newTemp,
                nextSnow: 'Tonight (65%)',
                warning: closedCount > 0 ? 'Strong winds at summit' : 'No unusual warnings',
                lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                detailedStatus: detailedStatus
            }, { merge: true });

        } catch (error) {
            console.error("Refresh failed:", error);
        } finally {
            setLoading(false);
        }
    }, [config, statusData.temp]); // Keep deps, though fetching fresh data makes temp dep less critical

    return { statusData, loading, refreshStatus };
};
