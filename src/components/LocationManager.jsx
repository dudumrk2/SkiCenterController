import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useConfig } from '../contexts/ConfigContext';
import { useRide } from '../contexts/RideContext';
import { db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// PILA (Aosta Valley) Base Coordinates
const PILA_BASE = { lat: 45.733, lng: 7.320 };

const LocationManager = () => {
    const { currentUser, updateUserStatus } = useAuth();
    const { config, tripId } = useConfig(); // Pull tripId
    const { isRecording } = useRide();

    useEffect(() => {
        if (!currentUser || !config) return;

        // Dynamic Interval: Use recording interval if recording, else standard
        const intervalMs = isRecording
            ? (config.recordingInterval || 5000)
            : (config.gpsInterval || 60000);

        const interval = setInterval(async () => {
            // Simulate movement around the base + random jitter
            // Uses configured hotel location if available, else Pila Base
            const baseLat = config.hotel?.location?.lat || PILA_BASE.lat;
            const baseLng = config.hotel?.location?.lng || PILA_BASE.lng;

            const jitter = 0.002;
            const lat = baseLat + (Math.random() * jitter - jitter / 2);
            const lng = baseLng + (Math.random() * jitter - jitter / 2);

            const location = { lat, lng };

            // 1. Send update to Local State (for UI)
            updateUserStatus('active', location);

            // 2. Sync to Cloud (If in Trip)
            if (tripId && currentUser) {
                try {
                    const userLocRef = doc(db, `trips/${tripId}/locations`, currentUser.uid);
                    await setDoc(userLocRef, {
                        uid: currentUser.uid,
                        displayName: currentUser.displayName || 'Anonymous Skier',
                        photoURL: currentUser.photoURL || null,
                        location: location,
                        status: 'active',
                        lastUpdated: serverTimestamp()
                    }, { merge: true });
                } catch (e) {
                    // Silently fail on network error to avoid spam
                }
            }

        }, intervalMs);

        return () => clearInterval(interval);
    }, [currentUser, config, isRecording, tripId]); // Re-run when mode or tripId changes

    return null;
};

export default LocationManager;
