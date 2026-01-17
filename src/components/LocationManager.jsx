import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useConfig } from '../contexts/ConfigContext';
import { useRide } from '../contexts/RideContext';
import { db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// PILA (Aosta Valley) Base Coordinates
const PILA_BASE = { lat: 45.733, lng: 7.320 };

import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

const LocationManager = () => {
    const { currentUser, updateUserStatus } = useAuth();
    const { config, tripId } = useConfig();
    const { isRecording } = useRide();

    useEffect(() => {
        if (!currentUser || !config) return;

        let watchId = null;
        let intervalId = null;

        const startTracking = async () => {
            const isNative = Capacitor.isNativePlatform();
            console.log(`[LocationService] Starting. Native: ${isNative}, Recording: ${isRecording}`);

            if (isNative) {
                // NATIVE: Use Capacitor Geolocation
                try {
                    await Geolocation.checkPermissions();
                    watchId = await Geolocation.watchPosition({
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 3000 // Allow slightly cached positions for battery
                    }, (position, err) => {
                        if (position) {
                            handleLocationUpdate({
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                            });
                        }
                    });
                } catch (e) {
                    console.error("Native GPS Error:", e);
                }
            } else {
                // WEB: Simulation (or Browser GPS if we wanted)
                // Keeping simulation as per original requirement for now, 
                // but effectively 'Ski Mode' wake lock keeps this interval alive.
                const intervalMs = isRecording ? (config.recordingInterval || 5000) : (config.gpsInterval || 60000);
                intervalId = setInterval(async () => {
                    const baseLat = config.hotel?.location?.lat || PILA_BASE.lat;
                    const baseLng = config.hotel?.location?.lng || PILA_BASE.lng;
                    const jitter = 0.002;
                    const lat = baseLat + (Math.random() * jitter - jitter / 2);
                    const lng = baseLng + (Math.random() * jitter - jitter / 2);
                    handleLocationUpdate({ lat, lng });
                }, intervalMs);
            }
        };

        const handleLocationUpdate = async (location) => {
            // 1. Local Update
            updateUserStatus('active', location);

            // 2. Cloud Sync
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
                } catch (e) { }
            }
        };

        startTracking();

        return () => {
            if (watchId) Geolocation.clearWatch({ id: watchId });
            if (intervalId) clearInterval(intervalId);
        };
    }, [currentUser, config, isRecording, tripId]);

    return null;
};

export default LocationManager;
