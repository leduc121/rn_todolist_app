// context/AppContext.tsx

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// ----- CÁC TYPES (KHUÔN MẪU) CHO DỮ LIỆU -----
export type SubtaskType = {
  id: string;
  text: string;
  completed: boolean;
};

export type TaskType = {
  id: string;
  text: string;
  subtasks: SubtaskType[];
  dueDate: Date | null;
};

// Dữ liệu mẫu ban đầu
const INITIAL_TASKS: TaskType[] = [
  {
    id: '1',
    text: 'Học React Native 🚀',
    subtasks: [
      { id: 's1', text: 'Cài đặt môi trường', completed: true },
      { id: 's2', text: 'Tạo dự án Expo', completed: true },
    ],
    dueDate: new Date(),
  },
];

// MỚI: Cập nhật Type
type AppContextType = {
  tasks: TaskType[];
  isLoading: boolean;
  handleToggleSubtask: (taskId: string, subtaskId: string) => void;
  handleAddSubtask: (taskId: string, subtaskText: string) => void;
  handleAddTask: (text: string) => void;
  handleDeleteTask: (taskId: string) => void;
  handleSetDueDate: (taskId: string, date: Date) => void;
  handleEditTask: (taskId: string) => void; // Hàm này giờ chỉ là "cò" để kích hoạt, logic sửa ở component
  handleUpdateTaskText: (taskId: string, newText: string) => void; // MỚI
  handleUpdateSubtaskText: (taskId: string, subtaskId: string, newText: string) => void; // MỚI
};

// Tạo Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Tạo Provider (Thành phần bao bọc)
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // (Phần Load/Save useEffect không đổi)
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const savedTasks = await AsyncStorage.getItem('tasks');
        if (savedTasks) {
          const parsedTasks = JSON.parse(savedTasks) as TaskType[];
          const tasksWithDates = parsedTasks.map(task => ({
            ...task,
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
          }));
          setTasks(tasksWithDates);
        } else {
          setTasks(INITIAL_TASKS);
        }
      } catch (e) {
        console.error("Failed to load tasks.", e);
        setTasks(INITIAL_TASKS);
      } finally {
        setIsLoading(false);
      }
    };
    loadTasks();
  }, []);

  useEffect(() => {
    const saveTasks = async () => {
      if (!isLoading) {
        try {
          const stringifiedTasks = JSON.stringify(tasks);
          await AsyncStorage.setItem('tasks', stringifiedTasks);
        } catch (e) {
          console.error("Failed to save tasks.", e);
        }
      }
    };
    saveTasks();
  }, [tasks, isLoading]);

  // ----- TOÀN BỘ LOGIC XỬ LÝ TASK -----
  
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
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

  const handleAddSubtask = (taskId: string, subtaskText: string) => {
    const newSubtask: SubtaskType = {
      id: `s-${Date.now().toString()}`,
      text: subtaskText,
      completed: false,
    };
    const newTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, subtasks: [...task.subtasks, newSubtask] };
      }
      return task;
    });
    setTasks(newTasks);
  };

  const handleAddTask = (inputText: string) => {
    if (inputText.trim().length === 0) return;
    const newTask: TaskType = {
      id: Date.now().toString(),
      text: inputText,
      subtasks: [],
      dueDate: null,
    };
    setTasks([...tasks, newTask]);
  };

  const handleDeleteTask = (taskId: string) => {
    const newTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(newTasks);
  };

  const handleSetDueDate = (taskId: string, date: Date) => {
    const newTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, dueDate: date };
      }
      return task;
    });
    setTasks(newTasks);
  };

  // Hàm này giờ chỉ để Alert, logic sửa đã chuyển sang component
  const handleEditTask = (taskId: string) => {
    const taskToEdit = tasks.find(t => t.id === taskId);
    // Bạn có thể để trống hàm này cũng được
  };

  // MỚI: Hàm logic để sửa tên Task chính
  const handleUpdateTaskText = (taskId: string, newText: string) => {
    const newTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, text: newText };
      }
      return task;
    });
    setTasks(newTasks);
  };

  // MỚI: Hàm logic để sửa tên Subtask
  const handleUpdateSubtaskText = (taskId: string, subtaskId: string, newText: string) => {
    const newTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const newSubtasks = task.subtasks.map((subtask) => {
          if (subtask.id === subtaskId) {
            return { ...subtask, text: newText };
          }
          return subtask;
        });
        return { ...task, subtasks: newSubtasks };
      }
      return task;
    });
    setTasks(newTasks);
  };


  // Cung cấp state và các hàm cho toàn bộ ứng dụng
  // MỚI: Cập nhật value
  const value = {
    tasks,
    isLoading,
    handleToggleSubtask,
    handleAddSubtask,
    handleAddTask,
    handleDeleteTask,
    handleSetDueDate,
    handleEditTask,
    handleUpdateTaskText,
    handleUpdateSubtaskText,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// (Hook useAppContext không đổi)
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};