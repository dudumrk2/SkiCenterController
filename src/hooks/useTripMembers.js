import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useConfig } from '../contexts/ConfigContext';
import { useAuth } from '../contexts/AuthContext';

export const useTripMembers = () => {
    const { tripId } = useConfig();
    const { currentUser } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tripId) {
            // No Trip = No other members
            setMembers([]);
            setLoading(false);
            return;
        }

        console.log("Subscribing to members of trip:", tripId);
        const locationsRef = collection(db, `trips/${tripId}/locations`);

        // Subscribe to all changes
        const unsubscribe = onSnapshot(locationsRef, (snapshot) => {
            const memberList = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                // Filter out self if needed, or keep self. 
                // Usually we filter self out in the map component to avoid double rendering
                if (data.uid !== currentUser?.uid) {
                    memberList.push({
                        id: data.uid,
                        name: data.displayName || 'Unknown',
                        photoURL: data.photoURL,
                        coordinates: data.location, // Map expects 'coordinates' {lat,lng}
                        status: {
                            // Adapting firestore structure to existing app structure
                            activity: data.status,
                            location: data.status === 'active' ? 'On Mountain' : data.status === 'SOS' ? 'SOS ALERT' : 'Offline',
                            // Could enhance this with real trail detection if we synced it
                        },
                        isSOS: data.status === 'SOS', // Flag for global alerts
                        lastUpdated: data.lastUpdated
                    });
                }
            });
            setMembers(memberList);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching trip members:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [tripId, currentUser]);

    return { members, loading };
};
