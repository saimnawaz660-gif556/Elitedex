import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  Asset,
  BinaryTrade,
  TradeSettlement,
  WalletTransaction,
  DepositRequest,
  WithdrawalRequest,
  PaymentMethod,
  NotificationItem,
  SupportTicket,
  SiteSettings,
  AuditLog,
} from './types';

export interface DatabaseSchema {
  users: User[];
  assets: Asset[];
  trades: BinaryTrade[];
  settlements: TradeSettlement[];
  transactions: WalletTransaction[];
  deposits: DepositRequest[];
  withdrawals: WithdrawalRequest[];
  paymentMethods: PaymentMethod[];
  notifications: NotificationItem[];
  supportTickets: SupportTicket[];
  siteSettings: SiteSettings;
  auditLogs: AuditLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_elitedex_salt_2026').digest('hex');
}

const INITIAL_ASSETS: Asset[] = [
  {
    id: 'btc-usd',
    symbol: 'BTC',
    name: 'Bitcoin',
    pair: 'BTC/USD',
    binanceSymbol: 'BTCUSDT',
    logo: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
    currentPrice: 68420.50,
    change24h: 2.45,
    high24h: 69150.00,
    low24h: 66890.00,
    volume24h: 28450190200,
    enabled: true,
    payoutRate: 88,
    durations: [30, 60, 120, 300, 900, 1800],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'eth-usd',
    symbol: 'ETH',
    name: 'Ethereum',
    pair: 'ETH/USD',
    binanceSymbol: 'ETHUSDT',
    logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    currentPrice: 3485.20,
    change24h: 1.82,
    high24h: 3540.00,
    low24h: 3390.10,
    volume24h: 14230490100,
    enabled: true,
    payoutRate: 87,
    durations: [30, 60, 120, 300, 900, 1800],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'sol-usd',
    symbol: 'SOL',
    name: 'Solana',
    pair: 'SOL/USD',
    binanceSymbol: 'SOLUSDT',
    logo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
    currentPrice: 178.60,
    change24h: 5.12,
    high24h: 182.40,
    low24h: 169.50,
    volume24h: 4210980000,
    enabled: true,
    payoutRate: 90,
    durations: [30, 60, 120, 300, 900, 1800],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'bnb-usd',
    symbol: 'BNB',
    name: 'BNB',
    pair: 'BNB/USD',
    binanceSymbol: 'BNBUSDT',
    logo: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
    currentPrice: 592.40,
    change24h: 0.94,
    high24h: 598.00,
    low24h: 585.20,
    volume24h: 1120400000,
    enabled: true,
    payoutRate: 85,
    durations: [30, 60, 120, 300, 900, 1800],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'xrp-usd',
    symbol: 'XRP',
    name: 'XRP',
    pair: 'XRP/USD',
    binanceSymbol: 'XRPUSDT',
    logo: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png',
    currentPrice: 0.584,
    change24h: -1.15,
    high24h: 0.602,
    low24h: 0.575,
    volume24h: 980400200,
    enabled: true,
    payoutRate: 86,
    durations: [30, 60, 120, 300, 900],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'doge-usd',
    symbol: 'DOGE',
    name: 'Dogecoin',
    pair: 'DOGE/USD',
    binanceSymbol: 'DOGEUSDT',
    logo: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png',
    currentPrice: 0.142,
    change24h: 3.40,
    high24h: 0.148,
    low24h: 0.136,
    volume24h: 810900000,
    enabled: true,
    payoutRate: 85,
    durations: [30, 60, 120, 300],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ada-usd',
    symbol: 'ADA',
    name: 'Cardano',
    pair: 'ADA/USD',
    binanceSymbol: 'ADAUSDT',
    logo: 'https://assets.coingecko.com/coins/images/975/small/cardano.png',
    currentPrice: 0.395,
    change24h: 1.10,
    high24h: 0.408,
    low24h: 0.388,
    volume24h: 420800000,
    enabled: true,
    payoutRate: 85,
    durations: [30, 60, 120, 300, 900],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'avax-usd',
    symbol: 'AVAX',
    name: 'Avalanche',
    pair: 'AVAX/USD',
    binanceSymbol: 'AVAXUSDT',
    logo: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png',
    currentPrice: 28.90,
    change24h: 4.25,
    high24h: 29.80,
    low24h: 27.40,
    volume24h: 530200000,
    enabled: true,
    payoutRate: 87,
    durations: [30, 60, 120, 300, 900],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'link-usd',
    symbol: 'LINK',
    name: 'Chainlink',
    pair: 'LINK/USD',
    binanceSymbol: 'LINKUSDT',
    logo: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
    currentPrice: 12.45,
    change24h: 2.10,
    high24h: 12.90,
    low24h: 12.10,
    volume24h: 310500000,
    enabled: true,
    payoutRate: 86,
    durations: [30, 60, 120, 300],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ltc-usd',
    symbol: 'LTC',
    name: 'Litecoin',
    pair: 'LTC/USD',
    binanceSymbol: 'LTCUSDT',
    logo: 'https://assets.coingecko.com/coins/images/2/small/litecoin.png',
    currentPrice: 72.80,
    change24h: 0.45,
    high24h: 74.20,
    low24h: 71.90,
    volume24h: 290100000,
    enabled: true,
    payoutRate: 85,
    durations: [30, 60, 120, 300],
    lastUpdated: new Date().toISOString(),
  },
];

const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'usdt-trc20',
    name: 'USDT (TRC20)',
    type: 'CRYPTO',
    instructions: 'Send USDT via the TRON (TRC20) network. Transfers on other networks may be permanently lost. Credits within 1 network confirmation.',
    accountDetails: 'TJqY4wU7b4uGgW6qJ5KzM2pL9e1x4v8R3t',
    minAmount: 20,
    maxAmount: 100000,
    feePercentage: 0,
    enabled: true,
  },
  {
    id: 'btc-network',
    name: 'Bitcoin (BTC Native)',
    type: 'CRYPTO',
    instructions: 'Send Bitcoin to the dedicated custody address below. Requires 1 block confirmation.',
    accountDetails: 'bc1q9v8h6g2m5k7w4p3z8e1x0y9r2t4u6v8x1q7',
    minAmount: 50,
    maxAmount: 250000,
    feePercentage: 0,
    enabled: true,
  },
  {
    id: 'eth-erc20',
    name: 'Ethereum (ERC20 / ETH)',
    type: 'CRYPTO',
    instructions: 'Send ETH directly to our smart custody receiver. Credits after 12 network confirmations.',
    accountDetails: '0x71C836471a3962b14646a782b6C4E1b1eB75E6E6',
    minAmount: 50,
    maxAmount: 200000,
    feePercentage: 0,
    enabled: true,
  },
  {
    id: 'bank-wire',
    name: 'International Bank Wire (USD/EUR)',
    type: 'BANK',
    instructions: 'Submit a deposit request to obtain your unique Swift reference code. Processing duration: 1-2 business days.',
    accountDetails: 'IBAN: GB29BARC20000087654321 / SWIFT: BARCGB22 / Beneficiary: EliteDex Capital Ltd',
    minAmount: 500,
    maxAmount: 500000,
    feePercentage: 0,
    enabled: true,
  },
];

const INITIAL_SETTINGS: SiteSettings = {
  siteName: 'EliteDex',
  maintenanceMode: false,
  minTradeAmount: 5,
  maxTradeAmount: 5000,
  defaultDemoBalance: 10000,
  defaultPayoutRate: 88,
  allowedDurations: [30, 60, 120, 300, 900, 1800],
  supportEmail: 'support@elitedex.com',
  liveMarketDataSource: 'BINANCE_PUBLIC',
};

class DatabaseManager {
  private db: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.db = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || [],
          assets: parsed.assets || INITIAL_ASSETS,
          trades: parsed.trades || [],
          settlements: parsed.settlements || [],
          transactions: parsed.transactions || [],
          deposits: parsed.deposits || [],
          withdrawals: parsed.withdrawals || [],
          paymentMethods: parsed.paymentMethods || INITIAL_PAYMENT_METHODS,
          notifications: parsed.notifications || [],
          supportTickets: parsed.supportTickets || [],
          siteSettings: { ...INITIAL_SETTINGS, ...(parsed.siteSettings || {}) },
          auditLogs: parsed.auditLogs || [],
        };
      }
    } catch (err) {
      console.error('Failed reading db.json, generating default database:', err);
    }

    const defaultDb: DatabaseSchema = {
      users: [
        {
          id: 'user_default_trader',
          name: 'Saim Nawaz',
          email: 'trader@elitedex.com',
          passwordHash: hashPassword('Trader123!'),
          role: 'user',
          status: 'active',
          realBalance: 1450.00,
          demoBalance: 10000.00,
          lockedBalance: 0,
          isDemoMode: true,
          twoFactorEnabled: false,
          referralCode: 'ELITE889',
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'user_admin_super',
          name: 'EliteDex Compliance Officer',
          email: 'admin@elitedex.com',
          passwordHash: hashPassword('AdminMaster99!'),
          role: 'admin',
          status: 'active',
          realBalance: 0,
          demoBalance: 0,
          lockedBalance: 0,
          isDemoMode: false,
          twoFactorEnabled: true,
          referralCode: 'ADMIN001',
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      assets: INITIAL_ASSETS,
      trades: [
        {
          id: 'TRD-78192',
          userId: 'user_default_trader',
          userEmail: 'trader@elitedex.com',
          assetId: 'btc-usd',
          symbol: 'BTC',
          pair: 'BTC/USD',
          direction: 'UP',
          stake: 100,
          entryPrice: 68120.00,
          entryTimestamp: Date.now() - 3600000,
          duration: 60,
          expiryTimestamp: Date.now() - 3600000 + 60000,
          payoutRate: 88,
          potentialPayout: 188,
          actualPayout: 188,
          expiryPrice: 68195.40,
          status: 'WON',
          isDemo: false,
          settlementTimestamp: Date.now() - 3600000 + 60000,
          settlementReason: 'Authoritative expiry price 68195.40 > entry price 68120.00 for UP prediction.',
          settlementSource: 'BINANCE_PUBLIC:BTCUSDT',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'TRD-78193',
          userId: 'user_default_trader',
          userEmail: 'trader@elitedex.com',
          assetId: 'eth-usd',
          symbol: 'ETH',
          pair: 'ETH/USD',
          direction: 'DOWN',
          stake: 50,
          entryPrice: 3490.50,
          entryTimestamp: Date.now() - 1800000,
          duration: 120,
          expiryTimestamp: Date.now() - 1800000 + 120000,
          payoutRate: 87,
          potentialPayout: 93.5,
          actualPayout: 0,
          expiryPrice: 3494.10,
          status: 'LOST',
          isDemo: false,
          settlementTimestamp: Date.now() - 1800000 + 120000,
          settlementReason: 'Authoritative expiry price 3494.10 >= entry price 3490.50 for DOWN prediction.',
          settlementSource: 'BINANCE_PUBLIC:ETHUSDT',
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        },
      ],
      settlements: [
        {
          id: 'SET-9901',
          tradeId: 'TRD-78192',
          userId: 'user_default_trader',
          symbol: 'BTC',
          direction: 'UP',
          stake: 100,
          entryPrice: 68120.00,
          expiryPrice: 68195.40,
          result: 'WON',
          payout: 188,
          payoutRate: 88,
          marketDataSource: 'BINANCE_PUBLIC:BTCUSDT',
          settledAt: new Date(Date.now() - 3600000 + 60000).toISOString(),
          deterministicFormula: 'ExpiryPrice (68195.40) > EntryPrice (68120.00) -> UP WIN => Stake (100) + Profit (88.00) = 188.00',
        },
        {
          id: 'SET-9902',
          tradeId: 'TRD-78193',
          userId: 'user_default_trader',
          symbol: 'ETH',
          direction: 'DOWN',
          stake: 50,
          entryPrice: 3490.50,
          expiryPrice: 3494.10,
          result: 'LOST',
          payout: 0,
          payoutRate: 87,
          marketDataSource: 'BINANCE_PUBLIC:ETHUSDT',
          settledAt: new Date(Date.now() - 1800000 + 120000).toISOString(),
          deterministicFormula: 'ExpiryPrice (3494.10) > EntryPrice (3490.50) -> DOWN LOSS => Payout = 0',
        },
      ],
      transactions: [
        {
          id: 'TX-1001',
          userId: 'user_default_trader',
          type: 'DEPOSIT',
          amount: 1500,
          currency: 'USD',
          referenceId: 'DEP-8841',
          description: 'USDT (TRC20) approved deposit',
          status: 'COMPLETED',
          isDemo: false,
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: 'TX-1002',
          userId: 'user_default_trader',
          type: 'TRADE_STAKE',
          amount: -100,
          currency: 'USD',
          referenceId: 'TRD-78192',
          description: 'Binary stake UP on BTC/USD',
          status: 'COMPLETED',
          isDemo: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'TX-1003',
          userId: 'user_default_trader',
          type: 'TRADE_PAYOUT',
          amount: 188,
          currency: 'USD',
          referenceId: 'TRD-78192',
          description: 'Binary WIN payout (88% profit)',
          status: 'COMPLETED',
          isDemo: false,
          createdAt: new Date(Date.now() - 3600000 + 60000).toISOString(),
        },
        {
          id: 'TX-1004',
          userId: 'user_default_trader',
          type: 'TRADE_STAKE',
          amount: -50,
          currency: 'USD',
          referenceId: 'TRD-78193',
          description: 'Binary stake DOWN on ETH/USD',
          status: 'COMPLETED',
          isDemo: false,
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        },
      ],
      deposits: [
        {
          id: 'DEP-8841',
          userId: 'user_default_trader',
          userEmail: 'trader@elitedex.com',
          methodId: 'usdt-trc20',
          methodName: 'USDT (TRC20)',
          amount: 1500,
          referenceId: 'txid_7384910284759283719284759283749283',
          proofNote: 'Approved automatically via ledger validation',
          status: 'APPROVED',
          adminNote: 'Verified hash on TronScan',
          processedBy: 'user_admin_super',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 2 + 180000).toISOString(),
        },
      ],
      withdrawals: [],
      paymentMethods: INITIAL_PAYMENT_METHODS,
      notifications: [
        {
          id: 'NOTIF-1',
          userId: 'user_default_trader',
          title: 'Welcome to EliteDex',
          message: 'Your account is ready. Explore live markets or practice risk-free with $10,000 Demo balance.',
          type: 'SYSTEM',
          read: true,
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
        {
          id: 'NOTIF-2',
          userId: 'user_default_trader',
          title: 'Trade Won: BTC/USD',
          message: 'Your 60s UP trade on BTC/USD settled as WIN. Payout of $188.00 credited to balance.',
          type: 'TRADE_WON',
          read: false,
          createdAt: new Date(Date.now() - 3600000 + 60000).toISOString(),
        },
      ],
      supportTickets: [
        {
          id: 'TCK-201',
          userId: 'user_default_trader',
          userEmail: 'trader@elitedex.com',
          userName: 'Saim Nawaz',
          subject: 'Inquiry regarding 30s settlement accuracy',
          category: 'TRADING',
          status: 'RESOLVED',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 + 3600000).toISOString(),
          messages: [
            {
              id: 'MSG-1',
              senderId: 'user_default_trader',
              senderName: 'Saim Nawaz',
              senderRole: 'user',
              content: 'Hello, could you explain the exact tick price reference used for binary expiry?',
              createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              id: 'MSG-2',
              senderId: 'user_admin_super',
              senderName: 'EliteDex Compliance Officer',
              senderRole: 'admin',
              content: 'All expirations are locked against the authoritative tick price from the verified public order-book stream at the exact millisecond of expiry, with zero slippage.',
              createdAt: new Date(Date.now() - 86400000 + 3600000).toISOString(),
            },
          ],
        },
      ],
      siteSettings: INITIAL_SETTINGS,
      auditLogs: [
        {
          id: 'AUD-01',
          adminId: 'user_admin_super',
          adminEmail: 'admin@elitedex.com',
          action: 'SYSTEM_BOOT',
          targetType: 'PLATFORM',
          targetId: 'MAIN',
          details: 'EliteDex binary settlement engine initialized with 10 crypto markets.',
          timestamp: new Date(Date.now() - 86400000 * 10).toISOString(),
        },
      ],
    };

    this.saveImmediate(defaultDb);
    return defaultDb;
  }

  private saveImmediate(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving db.json:', err);
    }
  }

  public save() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveImmediate(this.db);
      this.saveTimeout = null;
    }, 200);
  }

  public get<K extends keyof DatabaseSchema>(key: K): DatabaseSchema[K] {
    return this.db[key];
  }

  public update<K extends keyof DatabaseSchema>(key: K, value: DatabaseSchema[K]) {
    this.db[key] = value;
    this.save();
  }

  public getRaw(): DatabaseSchema {
    return this.db;
  }
}

export const db = new DatabaseManager();
