import React from 'react';
import './StreakWidget.css';

const StreakWidget = ({ habitStreaks }) => {
    return (
        <div className="streak-widget">
            <h2>Habit Streaks</h2>
            <div className="slideshow-container">
                {habitStreaks.map((streak, index) => (
                    <div className="slide" key={index}>
                        <h3>{streak.habit}</h3>
                        <p>Current Streak: {streak.currentStreak}</p>
                        <p>Longest Streak: {streak.longestStreak}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StreakWidget;