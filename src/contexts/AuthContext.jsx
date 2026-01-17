import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const [userStatus, setUserStatus] = useState({
        status: 'active',
        location: null,
        lift: null,
        trail: null
    });

    const loginWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Login Failed:", error);
            alert("Login failed: " + error.message);
        }
    };

    const logout = () => {
        return signOut(auth);
    };

    const updateUserStatus = async (status, location, lift, trail) => {
        // Optimistically update local state immediately
        setUserStatus({ status, location, lift, trail });

        if (!currentUser) return;
        // Log for verification
        console.log(`[Status Update] ${currentUser.displayName || 'User'}:`, { status, location, lift, trail });
    };

    return (
        <AuthContext.Provider value={{ currentUser, userStatus, loading, loginWithGoogle, logout, updateUserStatus }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
