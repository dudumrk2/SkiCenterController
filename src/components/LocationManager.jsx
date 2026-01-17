import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useConfig } from '../contexts/ConfigContext';

// Pila Base Coordinate for Simulation
const PILA_BASE = { lat: 45.733, lng: 7.320 };

const LocationManager = () => {
    const { currentUser, updateUserStatus } = useAuth();
    const { config } = useConfig();

    useEffect(() => {
        if (!currentUser || !config) return;

        const intervalMs = config.gpsInterval || 300000; // Default 5 min
        console.log(`Starting GPS Service. Interval: ${intervalMs}ms`);

        const interval = setInterval(() => {
            // Simulate movement around the base + random jitter
            const jitter = 0.002;
            const lat = PILA_BASE.lat + (Math.random() * jitter - jitter / 2);
            const lng = PILA_BASE.lng + (Math.random() * jitter - jitter / 2);

            const location = { lat, lng };

            // Send update
            // In production: Use navigator.geolocation.watchPosition
            updateUserStatus('active', location);
            console.log("GPS Tick:", location);

        }, intervalMs);

        return () => clearInterval(interval);
    }, [currentUser, config]);

    return null; // Headless component
};

export default LocationManager;
