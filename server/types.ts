export type TradeDirection = 'UP' | 'DOWN';
export type TradeStatus = 'ACTIVE' | 'WON' | 'LOST' | 'TIE' | 'CANCELLED';
export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRADE_STAKE' | 'TRADE_PAYOUT' | 'ADJUSTMENT' | 'DEMO_RESET';
export type DepositStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type WithdrawalStatus = 'PENDING' | 'PROCESSING' | 'APPROVED' | 'COMPLETED' | 'REJECTED';
export type TicketStatus = 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED';
export type TicketCategory = 'DEPOSIT' | 'WITHDRAWAL' | 'TRADING' | 'ACCOUNT' | 'TECHNICAL' | 'OTHER';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  realBalance: number;
  demoBalance: number;
  lockedBalance: number;
  isDemoMode: boolean;
  twoFactorEnabled: boolean;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  pair: string;
  binanceSymbol: string;
  logo: string;
  currentPrice: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  enabled: boolean;
  payoutRate: number; // e.g. 88 (meaning 88% profit on win)
  durations: number[]; // in seconds, e.g. [30, 60, 120, 300, 900, 1800]
  lastUpdated: string;
}

export interface Candle {
  time: number; // timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BinaryTrade {
  id: string;
  userId: string;
  userEmail: string;
  assetId: string;
  symbol: string;
  pair: string;
  direction: TradeDirection;
  stake: number;
  entryPrice: number;
  entryTimestamp: number; // ms
  duration: number; // seconds
  expiryTimestamp: number; // ms
  payoutRate: number; // e.g. 88
  potentialPayout: number; // stake + (stake * payoutRate / 100)
  actualPayout: number;
  expiryPrice: number | null;
  status: TradeStatus;
  isDemo: boolean;
  settlementTimestamp: number | null;
  settlementReason?: string;
  settlementSource?: string;
  createdAt: string;
}

export interface TradeSettlement {
  id: string;
  tradeId: string;
  userId: string;
  symbol: string;
  direction: TradeDirection;
  stake: number;
  entryPrice: number;
  expiryPrice: number;
  result: TradeStatus;
  payout: number;
  payoutRate: number;
  marketDataSource: string;
  settledAt: string;
  deterministicFormula: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  referenceId: string;
  description: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  isDemo: boolean;
  createdAt: string;
}

export interface DepositRequest {
  id: string;
  userId: string;
  userEmail: string;
  methodId: string;
  methodName: string;
  amount: number;
  referenceId: string;
  proofNote?: string;
  status: DepositStatus;
  adminNote?: string;
  processedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userEmail: string;
  method: string;
  destinationAddress: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: WithdrawalStatus;
  adminNote?: string;
  processedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'CRYPTO' | 'BANK' | 'E_WALLET';
  instructions: string;
  accountDetails: string;
  minAmount: number;
  maxAmount: number;
  feePercentage: number;
  enabled: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string; // or 'ADMIN' or 'ALL'
  title: string;
  message: string;
  type: 'TRADE_OPEN' | 'TRADE_WON' | 'TRADE_LOST' | 'DEPOSIT' | 'WITHDRAWAL' | 'SYSTEM' | 'SUPPORT';
  read: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  messages: {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: 'user' | 'admin';
    content: string;
    createdAt: string;
  }[];
}

export interface ReferralData {
  userId: string;
  referralCode: string;
  referredUsersCount: number;
  totalCommission: number;
  history: {
    id: string;
    referredUserEmail: string;
    date: string;
    rewardAmount: number;
  }[];
}

export interface SiteSettings {
  siteName: string;
  maintenanceMode: boolean;
  minTradeAmount: number;
  maxTradeAmount: number;
  defaultDemoBalance: number;
  defaultPayoutRate: number;
  allowedDurations: number[];
  supportEmail: string;
  liveMarketDataSource: 'BINANCE_PUBLIC' | 'SIMULATED';
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}
