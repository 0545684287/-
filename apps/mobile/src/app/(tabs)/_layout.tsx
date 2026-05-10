import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#2563eb', tabBarLabelStyle: { fontSize: 11 } }}>
      <Tabs.Screen name="index" options={{ title: 'דשבורד', tabBarIcon: ({ color }) => <Ionicons name="grid-outline" size={22} color={color} /> }} />
      <Tabs.Screen name="hr" options={{ title: 'עובדים', tabBarIcon: ({ color }) => <Ionicons name="people-outline" size={22} color={color} /> }} />
      <Tabs.Screen name="equipment" options={{ title: 'ציוד', tabBarIcon: ({ color }) => <Ionicons name="construct-outline" size={22} color={color} /> }} />
      <Tabs.Screen name="forms" options={{ title: 'טפסים', tabBarIcon: ({ color }) => <Ionicons name="document-text-outline" size={22} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'פרופיל', tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={22} color={color} /> }} />
    </Tabs>
  )
}
