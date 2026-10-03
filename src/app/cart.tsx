import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'expo-router';

export default function CartScreen() {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('السلة فارغة');
      return;
    }

    setLoading(true);
    // Here you would integrate with Stripe or your payment provider
    try {
      // For now, just navigate to a confirmation
      alert('تم إنشاء طلب بنجاح! سيتم التواصل معك قريباً');
      clearCart();
      router.push('/(home)');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>سلة التسوق</Text>
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>السلة فارغة</Text>
          <Text style={styles.emptyText}>أضف خدمات من المتجر</Text>
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>سلة التسوق</Text>
      </View>

      <ScrollView style={styles.content}>
        {cart.map((item) => (
          <View key={item.serviceId} style={styles.cartItem}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.service.nameAr}</Text>
              <Text style={styles.itemPrice}>{item.service.price} ر.س</Text>
            </View>

            <View style={styles.quantityControl}>
              <TouchableOpacity
                onPress={() => updateQuantity(item.serviceId, item.quantity - 1)}
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>

              <Text style={styles.quantity}>{item.quantity}</Text>

              <TouchableOpacity
                onPress={() => updateQuantity(item.serviceId, item.quantity + 1)}
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.itemTotal}>
              {item.service.price * item.quantity} ر.س
            </Text>

            <TouchableOpacity
              onPress={() => removeFromCart(item.serviceId)}
              style={styles.removeButton}
            >
              <Text style={styles.removeButtonText}>حذف</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>الإجمالي:</Text>
          <Text style={styles.summaryValue}>{getTotalPrice()} ر.س</Text>
        </View>

        <TouchableOpacity
          style={[styles.checkoutButton, loading && styles.buttonDisabled]}
          onPress={handleCheckout}
          disabled={loading}
        >
          <Text style={styles.checkoutButtonText}>
            {loading ? 'جاري المعالجة...' : 'متابعة الدفع'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(home)/services')}
          style={styles.continueShoppingButton}
        >
          <Text style={styles.continueShoppingText}>متابعة التسوق</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  cartItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 12,
    color: '#27ae60',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 14,
    color: '#333',
  },
  quantity: {
    marginHorizontal: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  itemTotal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e88e5',
    marginHorizontal: 10,
  },
  removeButton: {
    paddingHorizontal: 8,
  },
  removeButtonText: {
    color: '#d32f2f',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
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
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
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
  footer: {
    backgroundColor: 'white',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  checkoutButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  continueShoppingButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e88e5',
    borderRadius: 8,
  },
  continueShoppingText: {
    color: '#1e88e5',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
