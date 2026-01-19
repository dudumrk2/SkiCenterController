import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import pilaPreset from '../data/presets/pila.json'; // Fallback / Default for Dev
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tripId, setTripId] = useState(localStorage.getItem('currentTripId'));
    const [isAdmin, setIsAdmin] = useState(false);

    // We need currentUser to check admin status
    // safe because AuthProvider wraps ConfigProvider
    const { currentUser } = useAuth();

    // Store unsubscribe function to clean up listener
    const tripUnsubscribeRef = useRef(null);

    useEffect(() => {
        const initConfig = async () => {
            try {
                // 1. Check URL for tripId (Deep Linking)
                const params = new URLSearchParams(window.location.search);
                const urlTripId = params.get('tripId');

                if (urlTripId) {
                    console.log("Found Trip ID in URL:", urlTripId);
                    // Just set ID, the effect below will handle subscription
                    setTripId(urlTripId);
                    window.history.replaceState({}, '', window.location.pathname);
                } else if (!tripId) {
                    // 3. Fallback to Local Storage (Legacy/Solo Mode)
                    const storedConfig = localStorage.getItem('tripConfig');
                    if (storedConfig) {
                        try {
                            const parsed = JSON.parse(storedConfig);
                            // MIGRATION: Ensure new fields are added
                            if (parsed.resortName === pilaPreset.resortName) {
                                const newMapTarget = "/pila-map.jpg";
                                if (parsed.staticMapPdf !== newMapTarget) parsed.staticMapPdf = newMapTarget;
                                if (parsed.mapImage !== newMapTarget) parsed.mapImage = newMapTarget;
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

    // REAL-TIME SUBSCRIPTION TO TRIP
    useEffect(() => {
        if (!tripId) {
            setIsAdmin(false);
            return;
        }

        // Clean up previous listener if any
        if (tripUnsubscribeRef.current) {
            tripUnsubscribeRef.current();
        }

        console.log("Subscribing to Trip Config:", tripId);
        const tripRef = doc(db, "trips", tripId);

        tripUnsubscribeRef.current = onSnapshot(tripRef, (docSnap) => {
            if (docSnap.exists()) {
                const tripData = docSnap.data();
                const fetchedConfig = tripData.config;
                const adminId = tripData.adminId;

                // Check Admin Status
                if (currentUser && adminId === currentUser.uid) {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }

                // MIGRATION PATCH
                if (fetchedConfig.resortName === pilaPreset.resortName) {
                    const newMapTarget = "/pila-map.jpg";
                    if (fetchedConfig.staticMapPdf !== newMapTarget) fetchedConfig.staticMapPdf = newMapTarget;
                    if (fetchedConfig.mapImage !== newMapTarget) fetchedConfig.mapImage = newMapTarget;
                }

                setConfig(fetchedConfig);
                localStorage.setItem('tripConfig', JSON.stringify(fetchedConfig));
                localStorage.setItem('currentTripId', tripId);
            } else {
                console.warn("Trip document deleted or not found. Resetting.");
                resetConfig(); // KICK USER OUT
            }
        }, (error) => {
            console.error("Trip Sync Error:", error);
            // If permission denied or other error, arguably might want to kick out too
        });

        return () => {
            if (tripUnsubscribeRef.current) {
                tripUnsubscribeRef.current();
            }
        };

    }, [tripId, currentUser]);


    const saveConfig = async (newConfig) => {
        setConfig(newConfig);
        localStorage.setItem('tripConfig', JSON.stringify(newConfig));

        // This is local save, or initial save. 
        // If we are already in a trip, we should use updateTripConfig
    };

    const updateTripConfig = async (newConfig) => {
        if (!tripId) return;
        try {
            console.log("Broadcasting config update...", newConfig);
            const tripRef = doc(db, 'trips', tripId);
            await setDoc(tripRef, { config: newConfig }, { merge: true });
        } catch (e) {
            console.error("Failed to update config:", e);
            alert("Failed to update settings. Are you the admin?");
        }
    };

    const deleteTrip = async () => {
        if (!tripId) return;
        if (!isAdmin) {
            alert("Only the admin can delete the trip.");
            return;
        }

        if (window.confirm("WARNING: This will delete the trip for ALL users and kick them out immediately. Are you sure?")) {
            try {
                console.log("Deleting trip:", tripId);
                const tripRef = doc(db, 'trips', tripId);
                await deleteDoc(tripRef);
                // The onSnapshot will trigger resetConfig() for us, 
                // but we can call it manually to be instant locally
                resetConfig();
            } catch (e) {
                console.error("Failed to delete trip:", e);
                alert("Failed to delete trip.");
            }
        }
    };

    const resetConfig = () => {
        if (tripUnsubscribeRef.current) {
            tripUnsubscribeRef.current();
        }
        setConfig(null);
        localStorage.removeItem('tripConfig');
        setTripId(null);
        localStorage.removeItem('currentTripId');
        setIsAdmin(false);
        // Force reload to clear any lingering state if needed, or just let reactor handle it
        window.location.href = "/";
    };

    const createTrip = async (newConfig) => {
        try {
            const newTripId = Math.random().toString(36).substring(2, 8);
            const uid = currentUser ? currentUser.uid : 'anon';

            console.log("Creating Trip", newTripId, "Owner:", uid);

            const tripRef = doc(db, "trips", newTripId);
            await setDoc(tripRef, {
                config: newConfig,
                createdAt: serverTimestamp(),
                adminId: uid
            });

            // Set State - Effect will pick it up
            setTripId(newTripId);
            localStorage.setItem('currentTripId', newTripId);
            saveConfig(newConfig);

            return newTripId;
        } catch (error) {
            console.error("Error creating trip:", error);
            throw error;
        }
    };

    // joinTrip is now just setting the ID, the Effect handles the rest
    const joinTrip = async (id) => {
        setTripId(id);
        return true;
    };

    const leaveTrip = () => {
        resetConfig();
    };

    return (
        <ConfigContext.Provider value={{
            config,
            loading,
            saveConfig,
            updateTripConfig, // New
            deleteTrip,       // New
            resetConfig,
            tripId,
            isAdmin,          // New
            createTrip,
            joinTrip,
            leaveTrip
        }}>
            {children}
        </ConfigContext.Provider>
    );
};
