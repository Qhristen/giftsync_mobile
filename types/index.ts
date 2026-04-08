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
  userId: string;
  user: User;
  logoUrl: string;
  description: string;
  businessAddress: string;
  websiteUrl: string;
  instagramHandle?: string;
  location: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  isVerified: boolean;
}

export interface CreateBusinessDto {
  name: string;
  email: string;
  phone: string;
  logoUrl: string;
  description: string;
  businessAddress: string;
  websiteUrl: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
}

export interface UpdateBusinessDto extends Partial<CreateBusinessDto> { }

export interface Contact {
  id: string;
  userId: string;
  name: string;
  phoneNumber: string;
  email?: string;
  avatar?: string;
  relationship?: string;
  interests?: string[];
  budget?: 'LOW' | 'MID' | 'HIGH';
  notes?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactDto {
  name: string;
  phoneNumber: string;
  // email?: string;
  avatar?: string;
  relationship?: string;
  interests?: string[];
  budget?: 'LOW' | 'MID' | 'HIGH' | string;
  notes?: string;
  source?: string;
}

export interface UpdateContactDto extends Partial<CreateContactDto> { }

export interface Occasion {
  id: string;
  userId: string;
  contactId: string;
  contact?: Contact;
  type: string;
  date: string;
  recursYearly: boolean;
  source: string;
  dotColor: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOccasionDto {
  contactId: string;
  type: string;
  date: string;
  dotColor?: 'red' | 'blue' | 'green' | string;
  notes?: string;
  source?: string
}

export interface UpdateOccasionDto extends Partial<CreateOccasionDto> { }

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  imageUrls: string[];
  category: Category;
  tags: string[];
  ratingAvg: number;
  ratingCount: number;
  isAvailable: boolean;
  deliveryDays: number;
  business: Business;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  packagingFee: number;
  deliveryFee: number;
  currency?: string;
  imageUrls: string[];
  categoryId: string;
  tags?: string[];
  isAvailable?: boolean;
}

export interface UpdateProductDto extends Partial<CreateProductDto> { }

export interface RecommendationInputDto {
  occasionId: string;
  limit?: number;
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
  isRead: boolean;
  sentAt: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  unitPrice: number;
  quantity: number;
  total: number;
}

export type PaymentMethod = 'paystack' | 'flutterwave' | 'card' | 'cash' | 'coins';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  recipientName: string;
  deliveryDate: string; // ISO date (YYYY-MM-DD)
  deliveryTimeWindow: string;
  giftMessage: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  deliveryFee: number;
  packagingFee: number;
  total: number;
  deliveryCode: string;
  anonymity: boolean;
  conversationId: string;
  businessId: string;
  business: Business;
  occasion: Occasion;
  status: OrderStatus;
  deliveryAddress: Address;
  item: OrderItem;
  createdAt: string; // ISO datetime
}

export interface Address {
  id: string;
  userId: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressDto {
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  isDefault?: boolean;
}

export interface UpdateAddressDto extends Partial<CreateAddressDto> { }

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  content: string;
  conversationId: string;
  senderId: string;
  sender: User;
  isRead: boolean;
  readAt: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  orderId: string;
  order: Order;
  lastMessagePreview: string;
  lastMessageAt: string;
  lastMessageSenderId: string;
  participants: User[];
  messages: ChatMessage[];
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

// ── API response wrappers ───────────────────────────────────────────────────

export interface PaginatedMessagesResponse {
  data: {
    messages: ChatMessage[];
    total: number;
    page: number;
    limit: number;
  };
}

// ── DTOs ────────────────────────────────────────────────────────────────────

export interface CreateConversationDto {
  /** IDs of the other participants (current user is added automatically) */
  participantIds: string[];
  /** Optional: link the conversation to a specific order */
  orderId?: string;
}