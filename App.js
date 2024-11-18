import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, TextInput, View,
  FlatList, TouchableOpacity, Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTaskText, setEditedTaskText] = useState('');

  // Load tasks from AsyncStorage when the component mounts
  useEffect(() => {
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
    loadTasks();
  }, []);

  // Save tasks to AsyncStorage whenever tasks list is updated
  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error('Failed to save tasks:', error);
      }
    };
    saveTasks();
  }, [tasks]);

  const addTask = () => {
    if (task.trim()) {
      const newTask = { id: Date.now().toString(), text: task, completed: false };
      setTasks((prevTasks) => [...prevTasks, newTask]);
      setTask('');
    }
  };

  const deleteTask = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((item) => item.id !== taskId));
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((item) =>
        item.id === taskId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const startEditing = (taskId, currentText) => {
    setEditingTaskId(taskId);
    setEditedTaskText(currentText);
  };

  const saveEditedTask = () => {
    if (editedTaskText.trim()) {
      setTasks((prevTasks) =>
        prevTasks.map((item) =>
          item.id === editingTaskId ? { ...item, text: editedTaskText } : item
        )
      );
      setEditingTaskId(null);
      setEditedTaskText('');
    }
  };

  const animations = useRef({});

  useEffect(() => {
    tasks.forEach((task) => {
      if (!animations.current[task.id]) {
        animations.current[task.id] = {
          opacity: new Animated.Value(0),
          translateY: new Animated.Value(50),
        };
      }

      Animated.timing(animations.current[task.id].opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      Animated.timing(animations.current[task.id].translateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      tasks.forEach((task) => {
        if (!tasks.some(t => t.id === task.id)) {
          delete animations.current[task.id];
        }
      });
    };
  }, [tasks]);

  const renderItemWithAnimation = ({ item }) => {
    const animation = animations.current[item.id];

    if (!animation) return null;

    return (
      <Animated.View
        style={[
          styles.taskContainer,
          {
            opacity: animation?.opacity,
            transform: [{ translateY: animation?.translateY }],
          }
        ]}
      >
        <TouchableOpacity
          style={styles.taskTextContainer}
          onPress={() => toggleTaskCompletion(item.id)}
        >
          <Text style={[styles.taskText, item.completed && styles.completedTaskText]}>
            {item.text}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteTask(item.id)}>
          <Text style={styles.deleteButton}>X</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => startEditing(item.id, item.text)}>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple To-Do List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task"
          value={task}
          onChangeText={(text) => setTask(text)}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {editingTaskId && (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.input}
            value={editedTaskText}
            onChangeText={(text) => setEditedTaskText(text)}
            placeholder="Edit task"
          />
          <TouchableOpacity style={styles.addButton} onPress={saveEditedTask}>
            <Text style={styles.addButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={tasks}
        renderItem={renderItemWithAnimation}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#5C5CFF',
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  deleteButton: {
    color: '#FF5C5C',
    fontWeight: 'bold',
    fontSize: 18,
  },
  editButton: {
    color: '#5C5CFF',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
  editContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
});