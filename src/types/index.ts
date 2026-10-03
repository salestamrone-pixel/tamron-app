export interface User {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  company?: string;
  address?: string;
  createdAt: Date;
}

export interface Service {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: 'banners' | 'signage' | 'laser' | 'cnc' | 'other';
  price: number;
  image: string;
  details: string[];
  detailsAr: string[];
}

export interface Order {
  id: string;
  userId: string;
  serviceId: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  serviceId: string;
  service: Service;
  quantity: number;
}

export interface Portfolio {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  images: string[];
  category: string;
  createdAt: Date;
}
