import React, { createContext, useContext, useState, useEffect } from 'react';
import pilaPreset from '../data/presets/pila.json'; // Fallback / Default for Dev

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Fetch from Firestore 'config' collection
        // For now, checks local storage or defaults to null (forcing Config Screen)
        // OR for Dev speed, default to Pila:
        // setConfig(pilaPreset);

        const storedConfig = localStorage.getItem('tripConfig');
        if (storedConfig) {
            const parsed = JSON.parse(storedConfig);

            // MIGRATION / SYNC: Merge latest structure from Pila Preset if IDs match
            // This ensures new fields like 'mapPath' are applied to existing saved configs
            if (parsed.resortName === pilaPreset.resortName) {
                // Update Lifts
                parsed.lifts = pilaPreset.lifts.map(presetLift => {
                    const storedLift = parsed.lifts?.find(l => l.id === presetLift.id);
                    return storedLift ? { ...storedLift, ...presetLift } : presetLift;
                });
                // Update Trails
                parsed.trails = pilaPreset.trails.map(presetTrail => {
                    const storedTrail = parsed.trails?.find(t => t.id === presetTrail.id);
                    return storedTrail ? { ...storedTrail, ...presetTrail } : presetTrail;
                });

                // Fix for map image if still old
                const newMapUrl = "https://pila.it/p12021l4/wp-content/themes/pila/img/skirama.jpg";
                if (parsed.mapImage !== newMapUrl) {
                    parsed.mapImage = newMapUrl;
                }

                localStorage.setItem('tripConfig', JSON.stringify(parsed));
            }

            setConfig(parsed);
        } else {
            // Uncomment to force logic flow testing
            // setConfig(null); 
        }
        setLoading(false);
    }, []);

    const saveConfig = (newConfig) => {
        setConfig(newConfig);
        localStorage.setItem('tripConfig', JSON.stringify(newConfig));
        // TODO: Sync to Firestore
    };

    const resetConfig = () => {
        const confirm = window.confirm("Are you sure you want to change the trip configuration?");
        if (confirm) {
            setConfig(null);
            localStorage.removeItem('tripConfig');
        }
    };

    return (
        <ConfigContext.Provider value={{ config, loading, saveConfig, resetConfig }}>
            {children}
        </ConfigContext.Provider>
    );
};
