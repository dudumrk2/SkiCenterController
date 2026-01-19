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

            // 1. Fetch Real Weather (OpenWeatherMap)
            const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
            let weatherData = {};

            if (API_KEY) {
                try {
                    // Coordinates for Pila, Italy
                    const lat = 45.71;
                    const lon = 7.30;
                    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
                    const data = await response.json();

                    if (data.main && data.weather) {
                        weatherData = {
                            temp: Math.round(data.main.temp),
                            weather: data.weather[0].main, // e.g. 'Clouds', 'Snow'
                            wind: Math.round(data.wind.speed * 3.6) + ' km/h', // Convert m/s to km/h
                            desc: data.weather[0].description
                        };
                    }
                } catch (err) {
                    console.error("Weather Fetch Error:", err);
                }
            }

            // 2. Fetch Latest Firestore Data (to keep lift status if we aren't scraping yet)
            const snap = await getDoc(docRef);
            let currentStatus = {
                liftsOpen: 0,
                liftsTotal: config?.lifts?.length || 0,
                detailedStatus: {}
            };

            if (snap.exists()) {
                const data = snap.data();
                currentStatus = { ...currentStatus, ...data };
            }

            // 3. Update Firestore (Merge Real Weather + Existing/Scraped Lift Status)
            await setDoc(docRef, {
                ...currentStatus,
                ...(weatherData.temp !== undefined ? {
                    temp: weatherData.temp,
                    weather: weatherData.weather,
                    warning: weatherData.desc, // Use description as "warning" line for now
                } : {}),
                lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            }, { merge: true });

        } catch (error) {
            console.error("Refresh failed:", error);
        } finally {
            setLoading(false);
        }
    }, [config]);

    return { statusData, loading, refreshStatus };
};
