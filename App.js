import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, TextInput, View,
  FlatList, TouchableOpacity, Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const animationValue = useRef(new Animated.Value(0)).current;

  // Load tasks from AsyncStorage
  const loadTasks = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem('tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  // Save tasks to AsyncStorage
  const saveTasks = async (tasks) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  };

  const addOrUpdateTask = () => {
    if (task.trim()) {
      let updatedTasks;
      if (isEditing) {
        updatedTasks = tasks.map(item =>
          item.id === editTaskId ? { ...item, text: task } : item
        );
        setIsEditing(false);
        setEditTaskId(null);
      } else {
        const newTask = { id: Date.now().toString(), text: task, completed: false };
        updatedTasks = [...tasks, newTask];
        animateTaskAddition();
      }
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      setTask('');
    }
  };

  const deleteTask = (taskId) => {
    animateTaskDeletion(() => {
      const updatedTasks = tasks.filter((item) => item.id !== taskId);
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
    });
  };

  const toggleTaskCompletion = (taskId) => {
    const updatedTasks = tasks.map((item) =>
      item.id === taskId
        ? { ...item, completed: !item.completed }
        : item
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const editTask = (taskId, taskText) => {
    setTask(taskText);
    setEditTaskId(taskId);
    setIsEditing(true);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple To-Do List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={isEditing ? "Edit task" : "Add a new task"}
          value={task}
          onChangeText={(text) => setTask(text)}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={addOrUpdateTask}
        >
          <Text style={styles.addButtonText}>{isEditing ? "✓" : "+"}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <Animated.View style={[styles.taskContainer]}>
            <TouchableOpacity
              style={styles.taskTextContainer}
              onPress={() => toggleTaskCompletion(item.id)}
              onLongPress={() => editTask(item.id, item.text)}
            >
              <Text style={[styles.taskText, item.completed && styles.completedTaskText]}>
                {item.text}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Text style={styles.deleteButton}>X</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}