// App.js

import { useState } from 'react';
import {
    FlatList,
    Keyboard,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Dữ liệu mẫu ban đầu
const INITIAL_TASKS = [
  {
    id: '1',
    text: 'Học React Native 🚀',
    subtasks: [
      { id: 's1', text: 'Cài đặt môi trường', completed: true },
      { id: 's2', text: 'Tạo dự án Expo', completed: true },
      { id: 's3', text: 'Xây dựng giao diện', completed: false },
    ],
  },
  {
    id: '2',
    text: 'Đi chợ mua đồ 🛒',
    subtasks: [
      { id: 's1', text: 'Mua rau', completed: false },
      { id: 's2', text: 'Mua thịt', completed: false },
    ],
  },
];

// ----- Component Subtask: Hiển thị một công việc phụ -----
const Subtask = ({ subtask, onToggle }) => {
  return (
    <TouchableOpacity style={styles.subtaskContainer} onPress={onToggle}>
      <Text style={styles.checkbox}>{subtask.completed ? '✅' : '⬜️'}</Text>
      <Text style={[styles.subtaskText, subtask.completed && styles.completedText]}>
        {subtask.text}
      </Text>
    </TouchableOpacity>
  );
};

// ----- Component TodoItem: Hiển thị một công việc chính và tiến độ -----
const TodoItem = ({ task, onToggleSubtask }) => {
  // Tính toán tiến độ
  const completedCount = task.subtasks.filter((s) => s.completed).length;
  const totalCount = task.subtasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <View style={styles.taskContainer}>
      {/* Tiêu đề và phần trăm tiến độ */}
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle}>{task.text}</Text>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>

      {/* Thanh tiến độ */}
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>

      {/* Danh sách các subtask */}
      <View style={styles.subtasksList}>
        {task.subtasks.map((subtask) => (
          <Subtask
            key={subtask.id}
            subtask={subtask}
            onToggle={() => onToggleSubtask(task.id, subtask.id)}
          />
        ))}
      </View>
    </View>
  );
};


// ----- Component chính của ứng dụng -----
export default function App() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [inputText, setInputText] = useState('');

  // Hàm xử lý việc bật/tắt một subtask
  const handleToggleSubtask = (taskId, subtaskId) => {
    const newTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const newSubtasks = task.subtasks.map((subtask) => {
          if (subtask.id === subtaskId) {
            return { ...subtask, completed: !subtask.completed };
          }
          return subtask;
        });
        return { ...task, subtasks: newSubtasks };
      }
      return task;
    });
    setTasks(newTasks);
  };

  // Hàm thêm một task mới (chưa có subtask)
  const handleAddTask = () => {
    if (inputText.trim().length === 0) {
      return; // Không thêm task rỗng
    }
    const newTask = {
      id: Date.now().toString(), // Dùng timestamp làm id tạm thời
      text: inputText,
      subtasks: [], // Task mới chưa có subtask
    };
    setTasks([...tasks, newTask]);
    setInputText('');
    Keyboard.dismiss(); // Ẩn bàn phím
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Todo List</Text>
      
      {/* Danh sách các công việc */}
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <TodoItem task={item} onToggleSubtask={handleToggleSubtask} />
        )}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />

      {/* Khu vực nhập liệu để thêm task mới */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Thêm một công việc mới..."
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleAddTask} // Cho phép thêm bằng phím Enter
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


// ----- StyleSheet: Định dạng giao diện cho ứng dụng -----
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  list: {
    flex: 1,
    paddingHorizontal: 15,
  },
  taskContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007bff',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 15,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007bff',
    borderRadius: 4,
  },
  subtasksList: {
    marginTop: 5,
  },
  subtaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    marginRight: 10,
    fontSize: 18,
  },
  subtaskText: {
    fontSize: 16,
    color: '#555',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 45,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    marginRight: 10,
  },
  addButton: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});