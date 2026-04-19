export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  country: string;
  currency: string;
  theme: string;
  coinBalance: number;
  deviceTokens?: string[];
  createdAt: string;
  business: Business;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
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
  occasions?: Occasion[];
  relationship?: string;
  interests?: string[];
  budget?: 'LOW' | 'MID' | 'HIGH' | string;
  notes?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedContactResponse {
  items: Contact[];
  meta: PaginationMeta;
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

export interface OccasionTemplate {
  id: string;
  title: string;
  type: string;
  month: number;
  day: number;
  recurrence: 'NONE' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  iconUrl?: string;
  description?: string;
}

export interface Occasion {
  id: string;
  userId: string;
  contactId: string;
  contact?: Contact;
  templateId?: string;
  title: string;
  date: string;
  recurrenceType?: 'NONE' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  recurrenceRule?: {
    type: string;
    rules: any[];
  };
  isActive: boolean;
  source: string;
  googleEventId?: string;
  countdown?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOccasionDto {
  contactId?: string;
  templateId?: string;
  title: string;
  date: string;
  recurrenceType?: 'NONE' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  recurrenceRule?: {
    type: string;
    rules: any[];
  };
  isActive?: boolean;
  source?: string;
  googleEventId?: string;
}

export interface UpdateOccasionDto extends Partial<CreateOccasionDto> { }

export interface SubscribeOccasionDto {
  templateId: string;
  contactId: string;
}

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
  packagingFee: number;
  deliveryFee: number;
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
  deliveryDays?: number;
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

export interface WalletTransaction {
  id: string;
  type: 'purchase' | 'spend' | 'deposit' | 'withdrawal' | 'refund';
  amount: number;
  balanceAfter: number;
  description: string;
  reference: string;
  paymentMethod: string;
  createdAt: string;
}

export interface PaginatedWalletTransactionResponse {
  items: WalletTransaction[];
  meta: PaginationMeta;
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
  productName: string;
  productImage: string;
  businessName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  product: Product;
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
  occasion: Occasion;
  conversationId: string;
  subtotal: number;
  deliveryFee: number;
  packagingFee: number;
  deliveryAddress: Address
  total: number;
  deliveryCode: string;
  anonymity: boolean;
  status: OrderStatus;
  item: OrderItem;
  createdAt: string; // ISO datetime
}

export interface PaymentResponse {
  status: string;
  paymentMethod: string;
  checkoutUrl?: string;
  reference?: string;
  accessCode?: string;
  message?: string;
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
