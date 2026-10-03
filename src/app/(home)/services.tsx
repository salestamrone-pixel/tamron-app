import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useCart } from '@/context/CartContext';
import { Service } from '@/types';

// Sample services data - will be replaced with Firebase data
const SAMPLE_SERVICES: Service[] = [
  {
    id: '1',
    name: 'Banner Design',
    nameAr: 'تصميم بنرات',
    description: 'Custom banner design and printing',
    descriptionAr: 'تصميم وطباعة بنرات مخصصة',
    category: 'banners',
    price: 500,
    image: 'https://via.placeholder.com/300x200',
    details: ['High quality printing', 'Custom sizes', 'Fast delivery'],
    detailsAr: ['طباعة عالية الجودة', 'أحجام مخصصة', 'توصيل سريع'],
  },
  {
    id: '2',
    name: 'Signage',
    nameAr: 'لوحات',
    description: 'Professional signage solutions',
    descriptionAr: 'حلول لوحات احترافية',
    category: 'signage',
    price: 1000,
    image: 'https://via.placeholder.com/300x200',
    details: ['Durable materials', 'Weather resistant', 'Custom designs'],
    detailsAr: ['مواد متينة', 'مقاومة للعوامل الجوية', 'تصاميم مخصصة'],
  },
  {
    id: '3',
    name: 'Laser Cutting',
    nameAr: 'قطع بالليزر',
    description: 'Precision laser cutting service',
    descriptionAr: 'خدمة قطع الليزر بدقة عالية',
    category: 'laser',
    price: 750,
    image: 'https://via.placeholder.com/300x200',
    details: ['High precision', 'Multiple materials', 'Fast turnaround'],
    detailsAr: ['دقة عالية', 'مواد متعددة', 'إنجاز سريع'],
  },
  {
    id: '4',
    name: 'CNC Work',
    nameAr: 'أعمال CNC',
    description: 'CNC machining services',
    descriptionAr: 'خدمات الآلات الحفر CNC',
    category: 'cnc',
    price: 1200,
    image: 'https://via.placeholder.com/300x200',
    details: ['Precision work', 'Custom designs', 'Quality assurance'],
    detailsAr: ['أعمال دقيقة', 'تصاميم مخصصة', 'ضمان الجودة'],
  },
];

export default function ServicesScreen() {
  const [services, setServices] = useState<Service[]>(SAMPLE_SERVICES);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = (service: Service) => {
    addToCart(service, quantity);
    alert(`تم إضافة ${service.nameAr} إلى السلة`);
    setSelectedService(null);
    setQuantity(1);
  };

  const ServiceCard = ({ service }: { service: Service }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.serviceName}>{service.nameAr}</Text>
        <Text style={styles.serviceDesc}>{service.descriptionAr}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{service.price} ر.س</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddToCart(service)}
          >
            <Text style={styles.addButtonText}>أضف إلى السلة</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>خدماتنا</Text>
        <Text style={styles.subtitle}>اختر الخدمة التي تحتاجها</Text>
      </View>

      <View style={styles.servicesContainer}>
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
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
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#e3f2fd',
  },
  servicesContainer: {
    padding: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  cardContent: {
    padding: 15,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e88e5',
    marginBottom: 8,
  },
  serviceDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  addButton: {
    backgroundColor: '#1e88e5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});
