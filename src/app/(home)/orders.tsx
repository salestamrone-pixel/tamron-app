import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Order } from '@/types';

export default function OrdersScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
    }
  }, [user]);

  const StatusBadge = ({ status }: { status: string }) => {
    let color = '#999';
    let label = status;

    if (status === 'pending') {
      color = '#ff9800';
      label = 'قيد الانتظار';
    } else if (status === 'confirmed') {
      color = '#2196f3';
      label = 'مؤكد';
    } else if (status === 'in_progress') {
      color = '#ff5722';
      label = 'قيد المعالجة';
    } else if (status === 'completed') {
      color = '#27ae60';
      label = 'مكتمل';
    }

    return (
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeText}>{label}</Text>
      </View>
    );
  };

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>لا توجد طلبات</Text>
          <Text style={styles.emptyMessage}>
            ابدأ بإضافة خدمات من المتجر
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(home)/services')}
          >
            <Text style={styles.buttonText}>استعرض الخدمات</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>طلباتي</Text>
      </View>

      <View style={styles.ordersContainer}>
        {orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderTitle}>طلب #{order.id}</Text>
              <StatusBadge status={order.status} />
            </View>
            <View style={styles.orderDetails}>
              <Text style={styles.detailLabel}>الكمية: {order.quantity}</Text>
              <Text style={styles.detailLabel}>السعر: {order.totalPrice} ر.س</Text>
              <Text style={styles.detailLabel}>
                التاريخ: {new Date(order.createdAt).toLocaleDateString('ar-SA')}
              </Text>
            </View>
          </View>
        ))}
      </View>
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  ordersContainer: {
    padding: 15,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 15,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e88e5',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#555',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1e88e5',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});
