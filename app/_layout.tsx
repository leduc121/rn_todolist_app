// app/_layout.tsx

import { Slot } from 'expo-router';

// Layout này chỉ đơn giản là hiển thị bất cứ screen nào
// mà router tìm thấy (trong trường hợp này là layout (tabs))
export default function RootLayout() {
  return <Slot />;
}