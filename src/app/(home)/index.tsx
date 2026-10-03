import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>تامرون</Text>
        <Text style={styles.subtitle}>خدمات التصميم والطباعة والليزر</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>خدماتنا</Text>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/(home)/services')}
        >
          <Text style={styles.cardTitle}>استعرض جميع الخدمات</Text>
          <Text style={styles.cardDescription}>بنرات، لوحات، ليزر، CNC وأكثر</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>أعمالنا السابقة</Text>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/(home)/portfolio')}
        >
          <Text style={styles.cardTitle}>معرض الأعمال</Text>
          <Text style={styles.cardDescription}>شاهد أعمالنا السابقة والناجحة</Text>
        </TouchableOpacity>
      </View>

      {user ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>حسابك</Text>
          <Text style={styles.userInfo}>مرحباً {user.displayName || user.email}</Text>
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/(home)/orders')}
          >
            <Text style={styles.cardTitle}>طلباتي</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.cardTitle}>تسجيل الدخول</Text>
            <Text style={styles.cardDescription}>قم بتسجيل الدخول لمتابعة طلباتك</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1e88e5',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e3f2fd',
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e88e5',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
  userInfo: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
});
