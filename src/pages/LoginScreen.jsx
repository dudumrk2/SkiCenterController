import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaGoogle, FaSnowflake } from 'react-icons/fa';

const LoginScreen = () => {
    const { loginWithGoogle, currentUser } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (currentUser) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            textAlign: 'center',
            background: 'radial-gradient(circle at 50% 30%, #1e293b, #0f172a)'
        }}>
            <div className="glass-panel" style={{ padding: '40px', maxWidth: '400px', width: '100%' }}>
                <div style={{ fontSize: '3rem', color: 'var(--color-primary)', marginBottom: '20px' }}>
                    <FaSnowflake />
                </div>

                <h1 style={{ marginBottom: '10px' }}>Ski Command</h1>
                <p style={{ opacity: 0.7, marginBottom: '30px' }}>
                    Coordinate. Track. Ride.
                </p>

                <button
                    className="glass-btn"
                    onClick={loginWithGoogle}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        fontSize: '1.1rem',
                        background: 'white',
                        color: '#333',
                        border: 'none'
                    }}
                >
                    <FaGoogle /> Sign in with Google
                </button>

                <p style={{ marginTop: '20px', fontSize: '0.8rem', opacity: 0.5 }}>
                    Access restricted to Pila 2025 Group
                </p>
            </div>
        </div>
    );
};

export default LoginScreen;
