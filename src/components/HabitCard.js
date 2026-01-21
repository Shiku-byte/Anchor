import React from 'react';
import PropTypes from 'prop-types';

const HabitCard = ({ habit, onDelete }) => {
    return (
        <div className="habit-card">
            <h3>{habit.name}</h3>
            <p>Status: {habit.completed ? 'Completed' : 'Incomplete'}</p>
            <p>Streak: {habit.streak} days</p>
            <button onClick={onDelete}>Delete</button>
        </div>
    );
};

HabitCard.propTypes = {
    habit: PropTypes.shape({
        name: PropTypes.string.isRequired,
        completed: PropTypes.bool.isRequired,
        streak: PropTypes.number.isRequired,
    }).isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default HabitCard;