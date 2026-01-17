import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useConfig } from './ConfigContext';

const RideContext = createContext();

export const useRide = () => useContext(RideContext);

export const RideProvider = ({ children }) => {
    const { userStatus } = useAuth();
    const { config } = useConfig();

    const [isRecording, setIsRecording] = useState(false);
    const [currentPath, setCurrentPath] = useState([]);
    const [currentRideStats, setCurrentRideStats] = useState({
        distance: 0,
        startTime: null,
        duration: 0
    });

    const [history, setHistory] = useState([]);

    // Load history from localStorage on mount
    useEffect(() => {
        const storedHistory = localStorage.getItem('rideHistory');
        if (storedHistory) {
            try {
                setHistory(JSON.parse(storedHistory));
            } catch (e) {
                console.error("Failed to parse ride history", e);
            }
        }
    }, []);

    // Helper: Calculate distance between two lat/lng points (Haversine formula) in kilometers
    const calculateDistance = (pt1, pt2) => {
        if (!pt1 || !pt2) return 0;
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(pt2.lat - pt1.lat);
        const dLng = deg2rad(pt2.lng - pt1.lng);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(pt1.lat)) * Math.cos(deg2rad(pt2.lat)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2)
            ;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180);
    };

    // Tracking Logic
    useEffect(() => {
        if (!isRecording || !userStatus.location) return;

        // If it's the first point
        if (currentPath.length === 0) {
            setCurrentPath([{ ...userStatus.location, timestamp: Date.now() }]);
            return;
        }

        const lastPoint = currentPath[currentPath.length - 1];

        // Simple duplicate check (very basic)
        if (lastPoint.lat === userStatus.location.lat && lastPoint.lng === userStatus.location.lng) return;

        const newDist = calculateDistance(lastPoint, userStatus.location);

        // Update Path
        const newPoint = { ...userStatus.location, timestamp: Date.now() };
        setCurrentPath(prev => [...prev, newPoint]);

        // Update Stats
        setCurrentRideStats(prev => ({
            ...prev,
            distance: prev.distance + newDist,
            duration: (Date.now() - prev.startTime) / 1000 // duration in seconds
        }));

    }, [userStatus.location, isRecording]); // Dependency on location update

    // Timer for Duration
    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                if (currentRideStats.startTime) {
                    setCurrentRideStats(prev => ({
                        ...prev,
                        duration: (Date.now() - prev.startTime) / 1000
                    }));
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording, currentRideStats.startTime]);


    const startRecording = () => {
        setIsRecording(true);
        setCurrentPath([]);
        setCurrentRideStats({
            distance: 0,
            startTime: Date.now(),
            duration: 0
        });
    };

    const stopRecording = () => {
        setIsRecording(false);

        if (currentPath.length < 2) {
            alert("Ride too short to save.");
            return;
        }

        const newRide = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            startTime: currentRideStats.startTime,
            endTime: Date.now(),
            distance: currentRideStats.distance,
            duration: currentRideStats.duration,
            path: currentPath // Optional: Keep path if we want to show it on history map later
        };

        const updatedHistory = [newRide, ...history];
        setHistory(updatedHistory);
        localStorage.setItem('rideHistory', JSON.stringify(updatedHistory));
    };

    const clearHistory = () => {
        if (window.confirm("Are you sure you want to delete all ride history?")) {
            setHistory([]);
            localStorage.removeItem('rideHistory');
        }
    };

    return (
        <RideContext.Provider value={{
            isRecording,
            startRecording,
            stopRecording,
            currentPath,
            currentRideStats,
            history,
            clearHistory
        }}>
            {children}
        </RideContext.Provider>
    );
};

export default RideContext;
