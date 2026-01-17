import React, { useState } from 'react';
import { useConfig } from '../contexts/ConfigContext';

const Schedule = () => {
    // Static schedule structure for now, eventually from Config
    const days = [
        {
            id: 1,
            title: 'חימום והתאקלמות (19.1)',
            content: `התחלה: עלייה ברכבל המרכזי Aosta-Pila.

ציוד: איסוף הציוד מחנות La Soletta ממש ביציאה מהרכבל.

מעלית ראשונה: רכבל כיסאות Chamolé (B).

מסלולים:
גלישה במסלול 13 (כחול) – מסלול רחב וקל מאוד שחוזר לתחנת ה-Gondola.
חזרה על מעלית B וגלישה במסלול 15 (כחול) המוביל לאזור ה-Gorraz.

צהריים: הפסקה בבקתת Lo Baoutson (ליד מסלול 15).`
        },
        {
            id: 2,
            title: ' מעלים הילוך ל-Leissé (20.1)',
            content: `מטרה: גלישה במסלולים אדומים "רכים" ורחבים.

התחלה: מעלית Chamolé (B) וגלישה לכיוון מרכז האתר.

מעלית מרכזית: רכבל כיסאות Leissé (E).

מסלולים:
גלישה במסלול 19 (אדום) – זהו ה"אוטוסטרדה" של האתר. הוא רחב מאוד, מהנה ומושלם לסנובורד של אלון.
גלישה במסלול 14 (כחול) שמתחבר לאזור ה-Grimod (D) – אזור שטוח ונוח לשיפור טכניקה.

צהריים: בבקתת La Chatelaine (בסוף מסלול 19).`
        },
        {
            id: 3,
            title: ' כיבוש הפסגה - Couis 1 (21.1)',
            content: `מטרה: תצפית 360 מעלות על המונבלאן והמטרהורן וגלישה ארוכה מאוד.

התחלה: רצף מעליות: Chamolé (B) -> Leissé (E) -> וגלישה קצרה למעלית Couis 1 (G).

מסלולים:
תצפית: לפני הגלישה, לכו לנקודת התצפית בפסגה (2702 מטר).
גלישה במסלול 9 (אדום) – מסלול ארוך מאוד ומאתגר יותר, שחוזר כל הדרך למטה.

לאלון (סנובורד): ביקור ב-Area Effe Snowpark (ליד מעלית Grimod). יש שם אזורי קפיצות וריילים.`
        },
        {
            id: 4,
            title: ' חקירת אזור ה-Grimod ו-Couis 2 (22.1)',
            content: `מטרה: גיוון במסלולים צדדיים ופחות עמוסים.

התחלה: מעלית Gorraz-Grand Grimod (C).

מעלית: רכבל כיסאות Couis 2 (F).

מסלולים:
גלישה במסלול 8 (אדום) – מסלול יפהפה שמתפתל בין ההרים.
מסלול 16 (אדום) – חוזר לכיוון ה-Grimod.

אחה"צ: גלישה חופשית במסלולים האהובים עליכם מהימים הקודמים (סביר להניח שזה יהיה מסלול 19).`
        },
        {
            id: 5,
            title: 'גלישת פרידה וסיכום (23.1)',
            content: `מטרה: גלישה מהירה במסלולים המועדפים וסיום מוקדם למנהלות.

בוקר: עלייה ישירה ל-Couis 1 לגלישה אחרונה מהפסגה כשהשלג עוד טרי.

מסלולים: שילוב של מסלול 19 ו-מסלול 13 כדי לסיים בכיף.

צהריים (14:00): החזרת ציוד ל-La Soletta, לקיחת נעליים מהלוקר וירידה ברכבל לאאוסטה.

מנהלות: נסיעה לכיוון מלפנסה (מלון ליד השדה) כדי להיות מוכנים לטיסה המוקדמת ב-24.1.`
        }
    ];

    const [activeDay, setActiveDay] = useState(1);
    const dayData = days.find(d => d.id === activeDay);

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center' }}>Daily Schedule</h1>

            <div style={{
                display: 'flex',
                overflowX: 'auto',
                gap: '10px',
                paddingBottom: '10px',
                marginBottom: '20px',
                width: '100%',
                paddingRight: '20px', // Prevent cut-off feel
                WebkitOverflowScrolling: 'touch' // Smooth momentum scroll
            }}>
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
                <h2 style={{ marginTop: 0, color: 'var(--color-primary)', textAlign: 'right' }}>{dayData.title}</h2>
                <div style={{ fontSize: '1rem', lineHeight: '1.6', whiteSpace: 'pre-line', textAlign: 'right', direction: 'rtl' }}>
                    {dayData.content}
                </div>
            </div>
        </div>
    );
};

export default Schedule;
