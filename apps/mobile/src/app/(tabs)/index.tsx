import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>דשבורד בטיחות 🛡️</Text>
        <View style={styles.grid}>
          {[
            { label: 'עובדים פעילים', value: '-', color: '#dbeafe' },
            { label: 'הדרכות החודש', value: '-', color: '#ede9fe' },
            { label: 'ציוד לבדיקה', value: '-', color: '#ffedd5' },
            { label: 'טפסים פתוחים', value: '-', color: '#dcfce7' },
          ].map(card => (
            <View key={card.label} style={[styles.card, { backgroundColor: card.color }]}>
              <Text style={styles.cardValue}>{card.value}</Text>
              <Text style={styles.cardLabel}>{card.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'right', padding: 20, paddingBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 12 },
  card: { width: '46%', borderRadius: 16, padding: 16, margin: 3 },
  cardValue: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
  cardLabel: { fontSize: 13, color: '#6b7280', marginTop: 4, textAlign: 'right' },
})
