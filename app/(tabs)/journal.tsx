// app/(tabs)/journal.tsx

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, // Dùng SectionList
  Alert,
  Keyboard,
  SafeAreaView,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// ----- CÁC TYPES (KHUÔN MẪU) -----
type JournalEntry = {
  id: string; // Timestamp
  text: string;
  date: Date;
};

type JournalSection = {
  title: string; // Tên ngày
  data: JournalEntry[];
};

const JOURNAL_STORAGE_KEY = 'journal_entries';

// ----- HÀM HỖ TRỢ: Xử lý & Nhóm dữ liệu -----
const processEntriesToSections = (entries: JournalEntry[]): JournalSection[] => {
  const grouped: { [key: string]: JournalEntry[] } = {};
  const longDateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full' });

  for (const entry of entries) {
    const dateString = longDateFormatter.format(entry.date);
    if (!grouped[dateString]) {
      grouped[dateString] = [];
    }
    grouped[dateString].push(entry);
  }

  return Object.keys(grouped).map(dateTitle => ({
    title: dateTitle,
    data: grouped[dateTitle],
  }));
};


export default function JournalScreen() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // ----- LOGIC LƯU & TẢI -----
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const savedEntries = await AsyncStorage.getItem(JOURNAL_STORAGE_KEY);
        if (savedEntries) {
          const parsedEntries = JSON.parse(savedEntries) as any[];
          const loadedEntries = parsedEntries.map(e => ({
            ...e,
            date: new Date(e.date) 
          })).sort((a, b) => b.date.getTime() - a.date.getTime());
          setEntries(loadedEntries);
        }
      } catch (e) {
        console.error("Failed to load journal entries.", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadEntries();
  }, []);

  const sections = useMemo(() => {
    return processEntriesToSections(entries);
  }, [entries]);


  const handleSaveEntry = async () => {
    if (currentText.trim().length === 0) {
      Alert.alert("Chưa có nội dung", "Bạn chưa viết gì để lưu.");
      return;
    }

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      text: currentText,
      date: new Date(),
    };

    const newEntries = [newEntry, ...entries];

    try {
      setEntries(newEntries);
      await AsyncStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(newEntries));
      setCurrentText('');
      Keyboard.dismiss();
    } catch (e) {
      console.error("Failed to save journal entry.", e);
      Alert.alert("Lỗi", "Không thể lưu nhật ký.");
    }
  };
  
  // ----- RENDER GIAO DIỆN -----

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.emptyText}>Đang tải nhật ký...</Text>
      </View>
    );
  }

  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <View style={styles.entryContainer}>
      <Text style={styles.entryTime}>
        {item.date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
      </Text>
      <Text style={styles.entryText}>{item.text}</Text>
    </View>
  );

  const renderSectionHeader = ({ section: { title } }: { section: JournalSection }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.composeContainer}>
        <Text style={styles.title}>Viết nhật ký</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Bạn đang nghĩ gì?"
          placeholderTextColor="#999" // Màu code cứng
          value={currentText}
          onChangeText={setCurrentText}
          multiline={true}
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveEntry}>
          <Text style={styles.saveButtonText}>Lưu vào sổ 📝</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
      </View>
      
      <SectionList
        style={styles.list}
        sections={sections}
        renderItem={renderEntry}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Chưa có nhật ký nào.</Text>
        }
      />
    </SafeAreaView>
  );
}

// ----- STYLESHEET (Đã bỏ hàm, dùng code cứng) -----
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Code cứng
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5', // Code cứng
  },
  composeContainer: {
    padding: 20,
    paddingBottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333', // Code cứng
    textAlign: 'center',
    marginBottom: 15,
  },
  textInput: {
    backgroundColor: '#f9f9f9', // Code cứng
    color: '#333', // Code cứng
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    borderColor: '#eee', // Code cứng
    borderWidth: 1,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#28a745', // Code cứng
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee', // Code cứng
    marginTop: 20,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333', // Code cứng
    backgroundColor: '#f5f5f5', // Code cứng
    paddingVertical: 10,
  },
  entryContainer: {
    backgroundColor: '#fff', // Code cứng
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderColor: '#eee', // Code cứng
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  entryTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007bff', // Code cứng
    marginRight: 10,
    minWidth: 50,
  },
  entryText: {
    fontSize: 16,
    color: '#555', // Code cứng
    lineHeight: 22,
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: 'gray', // Code cứng
    marginTop: 20,
  },
});