// app/(tabs)/stats.tsx

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
// MỚI: Import "Não" để lấy dữ liệu
import { useAppContext } from '../../context/AppContext';

// MỚI: Component thanh tiến độ
const ProgressBar = ({ label, value }: { label: string, value: number }) => {
  const percentage = Math.round(value);
  return (
    <View style={styles.statItem}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.percentageText}>{percentage}%</Text>
      </View>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
};

export default function StatsScreen() {
  // MỚI: Lấy dữ liệu tasks và loading từ "Não"
  const { tasks, isLoading } = useAppContext();

  // ----- TÍNH TOÁN THỐNG KÊ -----

  // 1. Tổng số công việc
  const totalTasks = tasks.length;

  // 2. Số công việc đã hoàn thành (mọi subtask đều xong)
  const completedTasks = tasks.filter(task => {
    if (task.subtasks.length === 0 && totalTasks > 0) return false; // Task không có subtask thì không tính là xong
    return task.subtasks.every(sub => sub.completed);
  }).length;

  // 3. Phần trăm hoàn thành tổng
  const overallCompletion = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // 4. Tổng số subtask
  const totalSubtasks = tasks.reduce((sum, task) => sum + task.subtasks.length, 0);

  // 5. Số subtask đã hoàn thành
  const completedSubtasks = tasks.reduce((sum, task) => {
    return sum + task.subtasks.filter(sub => sub.completed).length;
  }, 0);

  // 6. Phần trăm hoàn thành subtask
  const subtaskCompletion = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
  
  // 7. Công việc quá hạn (dueDate < hôm nay VÀ chưa hoàn thành)
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Đặt về đầu ngày để so sánh
  
  const overdueTasks = tasks.filter(task => {
    const isCompleted = task.subtasks.length > 0 && task.subtasks.every(sub => sub.completed);
    if (!task.dueDate || isCompleted) return false;
    
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < now;
  }).length;

  // Màn hình loading
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Đang tải dữ liệu thống kê...</Text>
      </View>
    );
  }

  return (
    // Dùng ScrollView để nếu có nhiều thống kê thì có thể cuộn
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Thống kê công việc</Text>

        {/* Hiển thị các con số tổng quan */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryValue}>{totalTasks}</Text>
            <Text style={styles.summaryLabel}>Tổng việc</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryValue}>{completedTasks}</Text>
            <Text style={styles.summaryLabel}>Việc đã xong</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryValue}>{overdueTasks}</Text>
            <Text style={styles.summaryLabel}>Việc quá hạn</Text>
          </View>
        </View>

        {/* Hiển thị các thanh tiến độ */}
        <ProgressBar label="Tiến độ công việc (tổng)" value={overallCompletion} />
        <ProgressBar label="Tiến độ việc phụ (subtasks)" value={subtaskCompletion} />
        
        {totalTasks === 0 && (
          <Text style={styles.text}>Chưa có công việc nào để thống kê.</Text>
        )}
      </View>
    </ScrollView>
  );
}

// ----- STYLESHEET -----
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  text: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
  },
  // Style cho các ô tổng quan
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  summaryBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007bff',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  // Style cho thanh tiến độ
  statItem: {
    marginBottom: 25,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden', // Quan trọng
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
});