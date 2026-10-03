import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Text, Image, FlatList } from 'react-native';
import { Portfolio } from '@/types';

// Sample portfolio data
const SAMPLE_PORTFOLIO: Portfolio[] = [
  {
    id: '1',
    title: 'Corporate Branding',
    titleAr: 'العلامات التجارية للشركات',
    description: 'Professional branding solutions for corporate clients',
    descriptionAr: 'حلول علامات تجارية احترافية للعملاء من المؤسسات',
    images: ['https://via.placeholder.com/300x200'],
    category: 'branding',
    createdAt: new Date(),
  },
  {
    id: '2',
    title: 'Event Signage',
    titleAr: 'لوحات الأحداث',
    description: 'Custom signage for events and exhibitions',
    descriptionAr: 'لوحات مخصصة للأحداث والمعارض',
    images: ['https://via.placeholder.com/300x200'],
    category: 'events',
    createdAt: new Date(),
  },
  {
    id: '3',
    title: 'Laser Engraving',
    titleAr: 'النقش بالليزر',
    description: 'Precision laser engraving on various materials',
    descriptionAr: 'نقش ليزر دقيق على مواد متعددة',
    images: ['https://via.placeholder.com/300x200'],
    category: 'laser',
    createdAt: new Date(),
  },
];

export default function PortfolioScreen() {
  const [portfolio, setPortfolio] = useState<Portfolio[]>(SAMPLE_PORTFOLIO);

  const PortfolioCard = ({ item }: { item: Portfolio }) => (
    <View style={styles.card}>
      {item.images.length > 0 && (
        <Image
          source={{ uri: item.images[0] }}
          style={styles.image}
        />
      )}
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.titleAr}</Text>
        <Text style={styles.description}>{item.descriptionAr}</Text>
        <Text style={styles.category}>{item.category}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>معرض الأعمال</Text>
        <Text style={styles.subtitle}>تصفح أعمالنا السابقة الناجحة</Text>
      </View>

      <View style={styles.portfolioContainer}>
        {portfolio.map((item) => (
          <PortfolioCard key={item.id} item={item} />
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#e3f2fd',
  },
  portfolioContainer: {
    padding: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#e0e0e0',
  },
  cardContent: {
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e88e5',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  category: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});
