import React from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { useAuth } from '../contexts/AuthContext';
import StatusControl from '../components/StatusControl';
import ProfileCard from '../components/ProfileCard';
import ResortStatusCard from '../components/ResortStatusCard';
import MapWithStatus from '../components/MapWithStatus';

const Dashboard = () => {
    const { config } = useConfig();
    const { userStatus } = useAuth(); // Get live status

    if (!config) return null;

    // Helper to get name from ID
    const getStatusDisplay = () => {
        const { lift, trail, location } = userStatus;
        if (lift) {
            const l = config.lifts.find(i => i.id === lift);
            return {
                location: l ? l.name : lift, // Fallback to ID if not found
                activity: 'Taking Lift'
            };
        }
        if (trail) {
            const t = config.trails.find(i => i.id === trail);
            return {
                location: t ? t.name : trail,
                activity: 'Skiing Down'
            };
        }
        // Default
        return {
            location: config.hotel?.name || 'Resort',
            activity: 'Relaxing'
        };
    };

    const currentStatus = getStatusDisplay();

    return (
        <div className="dashboard">
            <ProfileCard />
            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>{config.resortName}</h1>

            {/* Real-time Status via Gemini */}
            <ResortStatusCard />

            <div className="glass-panel" style={{ padding: '15px', marginBottom: '15px', background: 'rgba(255,255,255,0.05)' }}>
                <h3 style={{ margin: '0 0 10px 0', color: 'var(--color-primary)' }}>Current Status</h3>
                <p>Location: <strong>{currentStatus.location}</strong></p>
                <p>Activity: <strong>{currentStatus.activity}</strong></p>
            </div>

            {/* Manual Status Control */}
            <StatusControl />

            {/* Combined Map & Live Status */}
            <MapWithStatus />




        </div>
    );
};

export default Dashboard;
