import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet } from 'react-native';

const AddHabitModal = ({ visible, onClose }) => {
    const [habitName, setHabitName] = useState('');
    const [habitDescription, setHabitDescription] = useState('');
    const [notificationTime, setNotificationTime] = useState('');

    const handleAddHabit = () => {
        // Handle adding a new habit
        console.log('Habit Added:', { habitName, habitDescription, notificationTime });
        // Clear inputs after adding
        setHabitName('');
        setHabitDescription('');
        setNotificationTime('');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide">
            <View style={styles.container}>
                <Text style={styles.title}>Add New Habit</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Habit Name"
                    value={habitName}
                    onChangeText={setHabitName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Description"
                    value={habitDescription}
                    onChangeText={setHabitDescription}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Notification Time (HH:MM)"
                    value={notificationTime}
                    onChangeText={setNotificationTime}
                />
                <Button title="Add Habit" onPress={handleAddHabit} />
                <Button title="Cancel" onPress={onClose} />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, marginBottom: 20 },
    input: { borderBottomWidth: 1, marginBottom: 15, padding: 10, fontSize: 18 }
});

export default AddHabitModal;
