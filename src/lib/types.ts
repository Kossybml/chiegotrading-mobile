/** Shapes returned by the ChiegoTrading API v1 (see /api/v1/docs/). */
export type Money = { ngn: string; currency: string; display: string };

export type Category = { id: number; name: string; slug: string; product_count?: number };
export type Images = { thumb: string; medium: string; large: string };
export type Rating = { average: number | null; count: number };

export type Product = {
  id: number;
  slug: string;
  name: string;
  grade: string;
  category: Category | null;
  price: Money;
  unit: string;
  moq: number;
  origin: string;
  export_ready: boolean;
  stock_note: string;
  images: Images;
  seller: { name: string; official: boolean; verified: boolean };
  rating: Rating;
};
export type ProductDetail = Product & {
  description: string;
  specs: { label: string; value: string }[];
  created: string;
  updated: string;
};

export type Review = {
  id: number;
  rating: number;
  title: string;
  body: string;
  author: string;
  verified_purchase: boolean;
  mine: boolean;
  created: string;
  updated: string;
};

export type Paged<T> = { count: number; next: string | null; previous: string | null; results: T[] };

export type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  company: string;
  role: 'buyer' | 'seller';
  is_seller: boolean;
  verified_seller: boolean;
  avatar: string;
  initials: string;
  has_password: boolean;
  date_joined: string;
};
export type AuthResponse = { access: string; refresh: string; user: User };

export type OrderStatus = 'awaiting_payment' | 'payment_submitted' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type OrderItem = { product: number | null; name: string; seller_name: string; unit: string; price: Money; quantity: number; line_total: Money };
export type Order = {
  reference: string;
  status: OrderStatus;
  status_label: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  ship_method: 'pickup' | 'local' | 'export';
  pay_method: 'paystack' | 'invoice';
  items: OrderItem[];
  subtotal: Money;
  fee: Money;
  total: Money;
  can_pay: boolean;
  can_cancel: boolean;
  paid_at: string | null;
  created: string;
};
export type OrderSummary = Pick<Order, 'reference' | 'status' | 'status_label' | 'total' | 'can_pay' | 'can_cancel' | 'created'> & { item_count: number };

export type Quote = {
  lines: { product: number; name: string; unit: string; quantity: number; price: Money; line_total: Money }[];
  subtotal: Money;
  fee: Money;
  fee_rate: string;
  total: Money;
};

export type Meta = {
  site: { name: string; tagline: string; url: string; email: string; phone: string; address: string; registration_number: string };
  currencies: { code: string; symbol: string; name: string; decimals: number; ngn_per_unit: string }[];
  default_currency: string;
  payment_fee_rate: string;
  paystack_enabled: boolean;
  google_login_enabled: boolean;
  ship_methods: { value: Order['ship_method']; label: string }[];
  pay_methods: { value: Order['pay_method']; label: string }[];
  contact_topics: string[];
  otp: { length: number; lifetime_minutes: number; resend_seconds: number };
};

export type ActivityItem = { name: string; place: string; product: string; slug: string; image: string; ts: string };
export type Home = { categories: Category[]; new_arrivals: Product[]; top_rated: Product[]; activity: ActivityItem[] };
export type LegalPage = { slug: string; title: string; content: string; updated: string };

export type Listing = {
  id: number;
  slug: string;
  name: string;
  category: string | null;
  grade: string;
  description: string;
  price: string;
  unit: string;
  moq: number;
  origin: string;
  stock_note: string;
  export_ready: boolean;
  specs: { label: string; value: string }[];
  images: Images;
  status: 'pending' | 'live' | 'hidden';
  status_label: string;
  created: string;
  updated: string;
};
export type Sale = { order_reference: string; order_status: string; name: string; unit: string; quantity: number; price: Money; line_total: Money; placed: string };
