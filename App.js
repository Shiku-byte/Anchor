import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import HabitCard from './src/components/HabitCard';
import StreakWidget from './src/components/StreakWidget';
import AddHabitModal from './src/components/AddHabitModal';
import { ThemeContext } from './src/context/ThemeContext';
import { lightTheme, darkTheme } from './src/styles/themes';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [habits, setHabits] = useState([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);

  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    loadHabits();
    loadThemePreference();
    requestNotificationPermissions();
  }, []);

  const loadHabits = async () => {
    try {
      const savedHabits = await AsyncStorage.getItem('habits');
      if (savedHabits) {
        setHabits(JSON.parse(savedHabits));
      }
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  };

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('isDarkMode');
      if (savedTheme) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Notification permissions not granted');
    }
  };

  const saveHabits = async (updatedHabits) => {
    try {
      await AsyncStorage.setItem('habits', JSON.stringify(updatedHabits));
      setHabits(updatedHabits);
    } catch (error) {
      console.error('Error saving habits:', error);
    }
  };

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      await AsyncStorage.setItem('isDarkMode', JSON.stringify(newMode));
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const addHabit = (habitName, habitDescription, notificationTime) => {
    const newHabit = {
      id: Date.now().toString(),
      name: habitName,
      description: habitDescription,
      streak: 0,
      lastCompleted: null,
      notificationTime: notificationTime,
      completedDates: [],
    };
    const updatedHabits = [...habits, newHabit];
    saveHabits(updatedHabits);
    setAddModalVisible(false);
    scheduleNotification(newHabit);
  };

  const completeHabit = (habitId) => {
    const updatedHabits = habits.map((habit) => {
      if (habit.id === habitId) {
        const today = new Date().toDateString();
        const alreadyCompleted = habit.completedDates.includes(today);

        if (alreadyCompleted) {
          return habit;
        }

        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
        const newStreak = habit.lastCompleted === yesterday ? habit.streak + 1 : 1;

        return {
          ...habit,
          streak: newStreak,
          lastCompleted: today,
          completedDates: [...habit.completedDates, today],
        };
      }
      return habit;
    });
    saveHabits(updatedHabits);
  };

  const deleteHabit = (habitId) => {
    const updatedHabits = habits.filter((habit) => habit.id !== habitId);
    saveHabits(updatedHabits);
  };

  const scheduleNotification = async (habit) => {
    if (!habit.notificationTime) return;

    const [hours, minutes] = habit.notificationTime.split(':').map(Number);
    const trigger = new Date();
    trigger.setHours(hours, minutes, 0);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Time to complete: ${habit.name}`,
        body: habit.description || 'Keep your streak alive!',
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });
  };

  const isHabitCompletedToday = (habit) => {
    const today = new Date().toDateString();
    return habit.completedDates.includes(today);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}> 
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.borderColor }]}> 
          <Text style={[styles.headerTitle, { color: theme.text }]}>Anchor</Text> 
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.switchTrackFalse, true: theme.switchTrackTrue }}
            thumbColor={isDarkMode ? theme.switchThumbDark : theme.switchThumbLight}
          />
        </View> 

        {/* Streak Widget */}
        {habits.length > 0 && <StreakWidget habits={habits} theme={theme} />}

        {/* Habits List */}
        <ScrollView style={styles.habitsList} showsVerticalScrollIndicator={false}> 
          {habits.length === 0 ? (
            <View style={styles.emptyState}> 
              <Text style={[styles.emptyStateText, { color: theme.secondaryText }]}>No habits yet. Start building your routine!</Text> 
            </View> 
          ) : (
            habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                isCompleted={isHabitCompletedToday(habit)}
                onComplete={() => completeHabit(habit.id)}
                onDelete={() => deleteHabit(habit.id)}
                theme={theme}
              />
            ))
          )}
        </ScrollView> 

        {/* Add Habit Button */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.accentColor }]}
          onPress={() => setAddModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity> 

        {/* Add Habit Modal */}
        <AddHabitModal
          visible={addModalVisible}
          onClose={() => setAddModalVisible(false)}
          onAdd={addHabit}
          theme={theme}
        />
      </View>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  habitsList: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
});