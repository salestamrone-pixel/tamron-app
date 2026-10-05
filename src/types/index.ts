import type { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
}

export type StaffRole = 'employee' | 'admin';

export interface StaffMember {
  email: string;
  name: string;
  jobTitle: string;
  role: StaffRole;
  active: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  specHint: string;
}

export type QuoteStatus = 'new' | 'quoted' | 'in_progress' | 'done' | 'cancelled';

export interface QuoteReply {
  price: string;
  note: string;
  repliedAt: Timestamp | null;
}

export interface QuoteRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  phone: string;
  serviceId: string;
  serviceName: string;
  details: string;
  dimensions: string;
  quantity: string;
  location: string;
  status: QuoteStatus;
  reply?: QuoteReply;
  createdAt: Timestamp | null;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export type HrRequestType = 'leave' | 'permission';
export type HrRequestStatus = 'pending' | 'approved' | 'rejected';

export interface HrRequest {
  id: string;
  email: string;
  name: string;
  type: HrRequestType;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: HrRequestStatus;
  decisionNote?: string;
  createdAt: Timestamp | null;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  imageUrl?: string;
}

export interface WorkSite {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
}

export interface GeoPoint {
  lat: number;
  lng: number;
  accuracy: number | null;
}

export interface AttendanceRecord {
  id: string;
  email: string;
  name: string;
  date: string;
  siteId: string;
  siteName: string;
  checkIn: Timestamp | null;
  checkInLoc: GeoPoint;
  checkOut?: Timestamp | null;
  checkOutLoc?: GeoPoint;
}
