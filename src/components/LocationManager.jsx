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
            console.log(`[LocationService] Starting tracking`);

            try {
                const isNative = Capacitor.isNativePlatform();

                if (isNative) {
                    // Check permissions on Native
                    const perm = await Geolocation.checkPermissions();
                    if (perm.location !== 'granted') {
                        const req = await Geolocation.requestPermissions();
                        if (req.location !== 'granted') {
                            console.warn("Location permission denied (Native)");
                            return;
                        }
                    }
                } else {
                    // Web: Browser automatically handles permissions on first call to getCurrentPosition/watchPosition
                    // No need to call 'checkPermissions' which might throw 'Not Implemented'
                    console.log("Web Platform: Skipping manual permission check, browser will prompt.");
                }

                // Capacitor Geolocation.watchPosition works on Web too (wraps navigator.geolocation)
                watchId = await Geolocation.watchPosition({
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 3000
                }, (position, err) => {
                    if (err) {
                        console.error("Location Watch Error:", err);
                        return;
                    }
                    if (position) {
                        handleLocationUpdate({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        });
                    }
                });
            } catch (e) {
                console.error("GPS Start Error:", e);
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
