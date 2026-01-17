import React, { useState } from 'react';
import { useConfig } from '../contexts/ConfigContext';

const Schedule = () => {
    // Static schedule structure for now, eventually from Config
    const days = [
        { id: 1, title: 'Day 1: Arrival', content: 'Land at MXP (22:50). Pick up rental car. Drive to Aosta (2h). Check-in.' },
        { id: 2, title: 'Day 2: Warm Up', content: 'Pick up Ski Gear at La Soletta. Warm up on Chamolé and Leissé (Blue/Red). Lunch at Chalet du Soleil.' },
        { id: 3, title: 'Day 3: Adventure', content: 'Head to Couis 1 for panoramic views. Black run options for experts. Spa evening at hotel.' },
        { id: 4, title: 'Day 4: Full Day', content: 'Explore Grimod sector. Off-piste potential if fresh snow. Dinner in Aosta town.' },
    ];

    const [activeDay, setActiveDay] = useState(1);
    const dayData = days.find(d => d.id === activeDay);

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center' }}>Daily Schedule</h1>

            <div style={{ display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '10px', marginBottom: '20px' }}>
                {days.map(day => (
                    <button
                        key={day.id}
                        className="glass-btn"
                        style={{
                            background: activeDay === day.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                            flex: '0 0 auto',
                            color: activeDay === day.id ? '#0f172a' : 'white'
                        }}
                        onClick={() => setActiveDay(day.id)}
                    >
                        Day {day.id}
                    </button>
                ))}
            </div>

            <div className="glass-panel" style={{ padding: '30px', minHeight: '300px' }}>
                <h2 style={{ marginTop: 0, color: 'var(--color-primary)' }}>{dayData.title}</h2>
                <p style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>
                    {dayData.content}
                </p>
            </div>
        </div>
    );
};

export default Schedule;
