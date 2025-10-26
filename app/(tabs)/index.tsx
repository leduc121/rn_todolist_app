// app/(tabs)/index.tsx

import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { SubtaskType, TaskType, useAppContext } from '../../context/AppContext';

// ----- COMPONENT SUBTASK (Nâng cấp) -----
type SubtaskProps = {
  subtask: SubtaskType;
  onToggle: () => void;
  isEditing: boolean; // MỚI
  onTextChange: (newText: string) => void; // MỚI
};

const Subtask = ({
  subtask,
  onToggle,
  isEditing,
  onTextChange,
}: SubtaskProps) => {
  
  if (isEditing) {
    return (
      <View style={styles.subtaskContainer}>
        <TextInput
          style={styles.subtaskInputEditing}
          value={subtask.text}
          onChangeText={onTextChange}
          placeholder="Sửa việc phụ..."
          placeholderTextColor="#999"
        />
      </View>
    );
  }

  const textStyle = [
    styles.subtaskText,
    subtask.completed && styles.completedText
  ];

  return (
    <TouchableOpacity style={styles.subtaskContainer} onPress={onToggle}>
      <Text style={styles.checkbox}>{subtask.completed ? '✅' : '⬜️'}</Text>
      <Text style={textStyle}>{subtask.text}</Text>
    </TouchableOpacity>
  );
};

// ----- COMPONENT TODOITEM (Nâng cấp) -----
type TodoItemProps = {
  task: TaskType;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, subtaskText: string) => void;
  onDeleteTask: (taskId: string) => void;
  onSetDueDate: (taskId: string, date: Date) => void;
  onUpdateTaskText: (taskId: string, newText: string) => void; // MỚI
  onUpdateSubtaskText: (taskId: string, subtaskId: string, newText: string) => void; // MỚI
};

const TodoItem = ({
  task,
  onToggleSubtask,
  onAddSubtask,
  onDeleteTask,
  onSetDueDate,
  onUpdateTaskText,
  onUpdateSubtaskText,
}: TodoItemProps) => {
  const [subtaskText, setSubtaskText] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<TaskType>(task);

  const completedCount = task.subtasks.filter((s) => s.completed).length;
  const totalCount = task.subtasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleAddSubtaskPress = () => {
    if (subtaskText.trim().length === 0) return;
    onAddSubtask(task.id, subtaskText);
    setSubtaskText('');
    Keyboard.dismiss();
  };
  const handleDeletePress = () => {
    setMenuVisible(false);
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc muốn xóa công việc "${task.text}"?`,
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", style: "destructive", onPress: () => onDeleteTask(task.id) }
      ]
    );
  };
  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      onSetDueDate(task.id, selectedDate);
    }
  };
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN');
  };

  // ----- MỚI: Các hàm xử lý Sửa -----
  const handleEditPress = () => {
    setMenuVisible(false);
    setIsEditing(true);
    setEditedTask(task); 
    setIsExpanded(true); 
  };

  const handleSaveEdit = () => {
    Keyboard.dismiss();
    onUpdateTaskText(task.id, editedTask.text);
    editedTask.subtasks.forEach(sub => {
      onUpdateSubtaskText(task.id, sub.id, sub.text);
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTask(task);
  };

  const handleTitleChange = (newText: string) => {
    setEditedTask(prev => ({ ...prev, text: newText }));
  };

  const handleSubtaskTextChange = (subtaskId: string, newText: string) => {
    setEditedTask(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(sub => 
        sub.id === subtaskId ? { ...sub, text: newText } : sub
      )
    }));
  };
  
  return (
    <View style={styles.taskContainer}>
      <View style={styles.taskHeader}>
        {isEditing ? (
          <TextInput
            style={styles.taskTitleInput}
            value={editedTask.text}
            onChangeText={handleTitleChange}
            placeholder="Sửa tiêu đề..."
            placeholderTextColor="#999"
          />
        ) : (
          <TouchableOpacity 
            style={styles.titleContainer} 
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <Text style={styles.taskTitle} numberOfLines={1}>{task.text}</Text>
            <Text style={styles.arrowIcon}>{isExpanded ? '▲' : '▼'}</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.headerRight}>
          {isEditing ? (
            <>
              <TouchableOpacity onPress={handleCancelEdit} style={styles.editButton}>
                <Text style={styles.cancelButtonText}>Hủy ❌</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveEdit} style={styles.editButton}>
                <Text style={styles.saveButtonText}>Lưu ✅</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
              <TouchableOpacity 
                onPress={() => setMenuVisible(!menuVisible)} 
                style={styles.menuButton}
              >
                <Text style={styles.menuButtonText}>⋮</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
      
      {menuVisible && !isEditing && (
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuOption} onPress={handleEditPress}>
            <Text style={styles.menuOptionText}>Sửa ✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuOption, styles.deleteOption]} onPress={handleDeletePress}>
            <Text style={[styles.menuOptionText, styles.deleteOptionText]}>Xóa ❌</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isEditing && (
        <View style={styles.detailsContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowPicker(true)}>
            <Text style={styles.datePickerText}>
              {task.dueDate ? formatDate(task.dueDate) : 'Chọn ngày 📅'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {showPicker && (
        <DateTimePicker
          value={task.dueDate || new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {(isExpanded || isEditing) && (
        <View>
          <View style={styles.subtasksList}>
            {(isEditing ? editedTask.subtasks : task.subtasks).map((subtask) => (
              <Subtask
                key={subtask.id}
                subtask={subtask}
                onToggle={() => onToggleSubtask(task.id, subtask.id)}
                isEditing={isEditing}
                onTextChange={(newText) => handleSubtaskTextChange(subtask.id, newText)}
              />
            ))}
          </View>

          {!isEditing && (
            <View style={styles.addSubtaskContainer}>
              <TextInput
                style={styles.subtaskInput}
                placeholder="Thêm việc phụ..."
                placeholderTextColor="#999"
                value={subtaskText}
                onChangeText={setSubtaskText}
                onSubmitEditing={handleAddSubtaskPress}
              />
              <TouchableOpacity
                style={styles.addSubtaskButton} // <--- DÙNG STYLE BỊ THIẾU Ở ĐÂY
                onPress={handleAddSubtaskPress}
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};


// ----- COMPONENT CHÍNH CỦA MÀN HÌNH -----
export default function TodoScreen() {
  const {
    tasks, isLoading,
    handleToggleSubtask, handleAddSubtask, handleAddTask,
    handleDeleteTask, handleSetDueDate,
    handleUpdateTaskText, handleUpdateSubtaskText
  } = useAppContext();
  
  const [inputText, setInputText] = useState('');

  const handleAddTaskPress = () => {
    handleAddTask(inputText);
    setInputText('');
    Keyboard.dismiss();
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Đang tải công việc...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.title}>My Todo List</Text>
        
        <FlatList
          data={tasks}
          renderItem={({ item }) => (
            <TodoItem
              task={item}
              onToggleSubtask={handleToggleSubtask}
              onAddSubtask={handleAddSubtask} 
              onDeleteTask={handleDeleteTask}
              onSetDueDate={handleSetDueDate}
              onUpdateTaskText={handleUpdateTaskText}
              onUpdateSubtaskText={handleUpdateSubtaskText}
            />
          )}
          keyExtractor={(item) => item.id}
          style={styles.list}
          onScrollBeginDrag={Keyboard.dismiss}
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Thêm một công việc mới..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleAddTaskPress}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddTaskPress}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}


// ----- STYLESHEET (Đã thêm style cho Edit) -----
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
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
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    flexShrink: 1,
  },
  arrowIcon: {
    fontSize: 16,
    marginLeft: 8,
    color: '#555',
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007bff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    marginLeft: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  menuButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#555',
    lineHeight: 24,
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    position: 'absolute',
    right: 15,
    top: 50,
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  menuOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuOptionText: {
    fontSize: 16,
    color: '#333',
  },
  deleteOption: {
    borderBottomWidth: 0,
  },
  deleteOptionText: {
    color: '#dc3545',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    flex: 1,
    marginRight: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007bff',
    borderRadius: 4,
  },
  datePickerButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  datePickerText: {
    color: '#555',
    fontSize: 12,
  },
  subtasksList: {
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 5,
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
  addSubtaskContainer: {
    flexDirection: 'row',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  subtaskInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  
  // ***** ĐÂY LÀ STYLE ĐÃ BỊ THIẾU *****
  addSubtaskButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#28a745', // Màu xanh lá
    justifyContent: 'center',
    alignItems: 'center',
  },
  // **********************************

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

  // ----- MỚI: Style cho chế độ Sửa -----
  taskTitleInput: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    padding: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  subtaskInputEditing: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginLeft: 5,
  },
  saveButtonText: {
    color: '#28a745', // Xanh lá
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButtonText: {
    color: '#dc3545', // Đỏ
    fontWeight: 'bold',
    fontSize: 16,
  },
});