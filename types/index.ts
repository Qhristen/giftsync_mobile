export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  country: string;
  currency: string;
  theme: string;
  coinBalance: number;
  business: Business;
}

export interface Business {
  id: string;
  name: string;
  email: string;
  phone: string;
  logoUrl: string;
  description: string;
  businessAddress: string;
  websiteUrl: string;
  location: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  isVerified: boolean;
}

export interface Occasion {
  id: string;
  userId: string;
  type: string;
  date: string;
  recursYearly: boolean;
  source: string;
  contactName?: string;
  contactNumber?: string;
  contactAvatar?: string;
  dotColor: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOccasionDto {
  type: string;
  date: string;
  contactName?: string;
  notes?: string;
  contactAvatar?: string;
  contactNumber?: string;
  dotColor: string;
}

export interface UpdateOccasionDto extends Partial<CreateOccasionDto> {}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  price: number;
  currency: string;
  imageUrls: string[];
  category: string;
  tags: string[];
  ratingAvg: number;
  ratingCount: number;
  isAvailable: boolean;
  business: Business;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  imageUrls: string[];
  category: string;
  tags?: string[];
  isAvailable?: boolean;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedProductResponse {
  items: Product[];
  meta: PaginationMeta;
}

export interface WalletBalance {
  balance: number;
}

export interface UnreadCount {
  count: number;
}

export interface CoinPackage {
  id: string;
  label: string;
  coinAmount: number;
  price: number;
  currency: string;
  isPopular: boolean;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, string>;
  isRead: false;
  sentAt: string;
  createdAt: string;
}
