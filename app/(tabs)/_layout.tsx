// app/(tabs)/_layout.tsx

import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { AppProvider } from '../../context/AppContext'; // Import "Não"

// Hàm này là layout chính cho các tab
export default function TabLayout() {
  return (
    // BỌC TOÀN BỘ CÁC TAB BẰNG "NÃO" (AppProvider)
    <AppProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#007bff', // Màu cho tab đang active
          tabBarInactiveTintColor: 'gray',
        }}>
        <Tabs.Screen
          name="index" // Trỏ đến file app/(tabs)/index.tsx
          options={{
            title: 'Todo List',
            tabBarIcon: ({ color }) => (
              // SỬA LỖI Ở ĐÂY: "list-check" -> "tasks"
              <FontAwesome name="tasks" size={24} color={color} />
            ),
            headerShown: false, // Ẩn tiêu đề (vì màn hình Todo đã có)
          }}
        />
        <Tabs.Screen
          name="stats" // Trỏ đến file app/(tabs)/stats.tsx
          options={{
            title: 'Thống kê',
            tabBarIcon: ({ color }) => (
              <FontAwesome name="pie-chart" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="journal" // Trỏ đến file app/(tabs)/journal.tsx
          options={{
            title: 'Nhật ký',
            tabBarIcon: ({ color }) => (
              <FontAwesome name="book" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </AppProvider>
  );
}