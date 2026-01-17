import React, { createContext, useContext, useState, useEffect } from 'react';
import pilaPreset from '../data/presets/pila.json'; // Fallback / Default for Dev
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tripId, setTripId] = useState(localStorage.getItem('currentTripId'));

    useEffect(() => {
        const initConfig = async () => {
            try {
                // 1. Check URL for tripId (Deep Linking)
                const params = new URLSearchParams(window.location.search);
                const urlTripId = params.get('tripId');

                if (urlTripId) {
                    console.log("Found Trip ID in URL:", urlTripId);
                    const success = await joinTrip(urlTripId);
                    if (success) {
                        window.history.replaceState({}, '', window.location.pathname);
                    }
                } else if (tripId) {
                    // 2. Re-hydrate existing session
                    const success = await joinTrip(tripId);
                    if (!success) {
                        console.warn("Failed to rejoin trip, clearing ID");
                        setTripId(null);
                        localStorage.removeItem('currentTripId');
                    }
                } else {
                    // 3. Fallback to Local Storage (Legacy/Solo Mode)
                    const storedConfig = localStorage.getItem('tripConfig');
                    if (storedConfig) {
                        try {
                            const parsed = JSON.parse(storedConfig);

                            // MIGRATION: Ensure new fields are added to existing configs
                            if (parsed.resortName === pilaPreset.resortName) {
                                // Add/Update Static Map Image
                                // Force update to the new local image if it was the old PDF or missing
                                const newMapTarget = "/pila-map.jpg";
                                if (parsed.staticMapPdf !== newMapTarget) {
                                    parsed.staticMapPdf = newMapTarget;
                                    console.log("Migrated Config: Updated staticMapPdf to local image");
                                }
                                if (parsed.mapImage !== newMapTarget) {
                                    parsed.mapImage = newMapTarget;
                                    console.log("Migrated Config: Updated mapImage to local image");
                                }
                                // Ensure GPS intervals are present
                                if (!parsed.gpsInterval) parsed.gpsInterval = 60000;
                            }

                            setConfig(parsed);
                        } catch (e) {
                            console.error("Corrupt local config, clearing.", e);
                            localStorage.removeItem('tripConfig');
                        }
                    }
                }
            } catch (err) {
                console.error("Critical Config Init Error:", err);
            } finally {
                setLoading(false);
            }
        };
        initConfig();
    }, []);

    const saveConfig = async (newConfig) => {
        setConfig(newConfig);
        localStorage.setItem('tripConfig', JSON.stringify(newConfig));

        // Sync to Cloud if in a Shared Trip
        if (tripId) {
            try {
                console.log("Syncing config to Cloud Trip:", tripId);
                const tripRef = doc(db, 'trips', tripId);
                await setDoc(tripRef, { config: newConfig }, { merge: true });
            } catch (e) {
                console.error("Failed to sync config to cloud:", e);
            }
        }
    };

    const resetConfig = () => {
        const confirm = window.confirm("Are you sure you want to change the trip configuration?");
        if (confirm) {
            setConfig(null);
            localStorage.removeItem('tripConfig');
            setTripId(null);
            localStorage.removeItem('currentTripId');
        }
    };

    const createTrip = async (newConfig) => {
        try {
            // Generate a simple readable ID (or use random)
            const newTripId = Math.random().toString(36).substring(2, 8); // e.g. "xy9z2k"

            const tripRef = doc(db, "trips", newTripId);
            await setDoc(tripRef, {
                config: newConfig,
                createdAt: serverTimestamp(),
                adminId: "anon" // Could bind to auth.currentUser.uid if available
            });

            // Set State
            setTripId(newTripId);
            localStorage.setItem('currentTripId', newTripId);
            saveConfig(newConfig); // Also save locally

            return newTripId;
        } catch (error) {
            console.error("Error creating trip:", error);
            throw error;
        }
    };

    const joinTrip = async (id) => {
        try {
            const tripRef = doc(db, "trips", id);
            const tripSnap = await getDoc(tripRef);

            if (tripSnap.exists()) {
                const tripData = tripSnap.data();
                const fetchedConfig = tripData.config;

                // MIGRATION: Patch Cloud Config with new local assets
                if (fetchedConfig.resortName === pilaPreset.resortName) {
                    const newMapTarget = "/pila-map.jpg";
                    if (fetchedConfig.staticMapPdf !== newMapTarget) {
                        fetchedConfig.staticMapPdf = newMapTarget;
                    }
                    if (fetchedConfig.mapImage !== newMapTarget) {
                        fetchedConfig.mapImage = newMapTarget;
                    }
                }

                setConfig(fetchedConfig);
                setTripId(id);
                localStorage.setItem('currentTripId', id);
                return true;
            } else {
                console.error("Trip not found!");
                return false;
            }
        } catch (error) {
            console.error("Error joining trip:", error);
            return false;
        }
    };

    const leaveTrip = () => {
        setTripId(null);
        localStorage.removeItem('currentTripId');
        setConfig(null); // Force back to config screen
    };

    return (
        <ConfigContext.Provider value={{ config, loading, saveConfig, resetConfig, tripId, createTrip, joinTrip, leaveTrip }}>
            {children}
        </ConfigContext.Provider>
    );
};
