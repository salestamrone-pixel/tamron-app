import type { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
}

export type StaffRole = 'employee' | 'hr' | 'admin';

export interface StaffMember {
  email: string;
  name: string;
  jobTitle: string;
  role: StaffRole;
  active: boolean;
  nationality?: 'saudi' | 'expat' | string;
  idNumber?: string;
  idExpiry?: string;
  hireDate?: string;
  contractEnd?: string;
  salary?: number;
  allowances?: number;
  shiftStart?: string;
  shiftEnd?: string;
  graceMin?: number;
}

export interface Advance {
  id: string;
  email: string;
  amount: number;
  month: string;
  note: string;
}

export type TaskStatus = 'todo' | 'doing' | 'done';

export interface Task {
  id: string;
  title: string;
  details: string;
  assigneeEmail: string;
  assigneeName: string;
  status: TaskStatus;
  note: string;
  createdAt: Timestamp | null;
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
  attachments?: string[];
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

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  phone?: string;
  emailVerified: boolean;
  role: string;
  platform: string;
  deviceModel: string | null;
  appBuild: number | null;
  createdAt: Timestamp | null;
  lastLoginAt: Timestamp | null;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  createdAt: Timestamp | null;
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
