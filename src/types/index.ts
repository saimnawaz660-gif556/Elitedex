export type TradeDirection = 'UP' | 'DOWN';
export type TradeStatus = 'ACTIVE' | 'WON' | 'LOST' | 'TIE' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  realBalance: number;
  demoBalance: number;
  lockedBalance: number;
  isDemoMode: boolean;
  twoFactorEnabled: boolean;
  referralCode: string;
  createdAt: string;
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
  payoutRate: number;
  durations: number[];
  lastUpdated: string;
}

export interface Candle {
  time: number;
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
  entryTimestamp: number;
  duration: number;
  expiryTimestamp: number;
  payoutRate: number;
  potentialPayout: number;
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
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRADE_STAKE' | 'TRADE_PAYOUT' | 'ADJUSTMENT' | 'DEMO_RESET';
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
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote?: string;
  createdAt: string;
}

export type TicketCategory = 'DEPOSIT' | 'WITHDRAWAL' | 'TRADING' | 'ACCOUNT' | 'TECHNICAL' | 'OTHER';

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userEmail: string;
  method: string;
  destinationAddress: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'APPROVED' | 'COMPLETED' | 'REJECTED';
  adminNote?: string;
  createdAt: string;
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
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  category: string;
  status: 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED';
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

export interface MarketStatus {
  isLive: boolean;
  dataSource: 'BINANCE_PUBLIC_API' | 'SIMULATED_DEMO_DATA';
  lastSync: number;
  assetsCount: number;
}
