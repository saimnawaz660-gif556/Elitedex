import crypto from 'crypto';
import { db } from './db';
import { marketService } from './marketService';
import {
  BinaryTrade,
  TradeDirection,
  TradeSettlement,
  WalletTransaction,
  NotificationItem,
} from './types';

export class TradeEngine {
  private settlementInterval: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor() {
    this.startSettlementLoop();
  }

  private startSettlementLoop() {
    this.settlementInterval = setInterval(() => {
      this.processExpiredTrades();
    }, 500);
  }

  public placeTrade(params: {
    userId: string;
    assetId: string;
    direction: TradeDirection;
    stake: number;
    duration: number; // in seconds
    isDemo: boolean;
  }): { success: boolean; trade?: BinaryTrade; error?: string } {
    const { userId, assetId, direction, stake, duration, isDemo } = params;

    // 1. Validate inputs
    const settings = db.get('siteSettings');
    if (settings.maintenanceMode) {
      return { success: false, error: 'EliteDex is currently under scheduled maintenance.' };
    }

    if (stake < settings.minTradeAmount) {
      return { success: false, error: `Minimum trade amount is $${settings.minTradeAmount}.` };
    }

    if (stake > settings.maxTradeAmount) {
      return { success: false, error: `Maximum trade amount is $${settings.maxTradeAmount}.` };
    }

    // 2. Validate asset
    const assets = db.get('assets');
    const asset = assets.find((a) => a.id === assetId && a.enabled);
    if (!asset) {
      return { success: false, error: 'Selected market is currently unavailable for trading.' };
    }

    if (!asset.durations.includes(duration)) {
      return { success: false, error: `Invalid duration ${duration}s for this asset.` };
    }

    // 3. Validate user & balance
    const users = [...db.get('users')];
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return { success: false, error: 'User account not found.' };
    }

    const user = users[userIndex];
    if (user.status === 'suspended') {
      return { success: false, error: 'Your account trading privileges are suspended.' };
    }

    const currentBalance = isDemo ? user.demoBalance : user.realBalance;
    if (currentBalance < stake) {
      return {
        success: false,
        error: `Insufficient ${isDemo ? 'Demo' : 'Real'} balance ($${currentBalance.toFixed(2)} available, $${stake.toFixed(2)} required).`,
      };
    }

    // 4. Capture exact current price & timestamps
    const entryPrice = asset.currentPrice;
    if (!entryPrice || entryPrice <= 0) {
      return { success: false, error: 'Unable to capture authoritative market price.' };
    }

    const now = Date.now();
    const expiryTimestamp = now + duration * 1000;
    const payoutRate = asset.payoutRate;
    const potentialPayout = Number((stake + (stake * payoutRate) / 100).toFixed(2));

    // 5. Deduct stake from available balance and move to locked
    if (isDemo) {
      user.demoBalance = Number((user.demoBalance - stake).toFixed(2));
    } else {
      user.realBalance = Number((user.realBalance - stake).toFixed(2));
      user.lockedBalance = Number((user.lockedBalance + stake).toFixed(2));
    }
    users[userIndex] = user;
    db.update('users', users);

    // 6. Create binary trade record
    const tradeId = `TRD-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const newTrade: BinaryTrade = {
      id: tradeId,
      userId: user.id,
      userEmail: user.email,
      assetId: asset.id,
      symbol: asset.symbol,
      pair: asset.pair,
      direction,
      stake,
      entryPrice,
      entryTimestamp: now,
      duration,
      expiryTimestamp,
      payoutRate,
      potentialPayout,
      actualPayout: 0,
      expiryPrice: null,
      status: 'ACTIVE',
      isDemo,
      settlementTimestamp: null,
      createdAt: new Date(now).toISOString(),
    };

    const trades = [...db.get('trades'), newTrade];
    db.update('trades', trades);

    // 7. Record transaction for stake
    const txId = `TX-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const newTx: WalletTransaction = {
      id: txId,
      userId: user.id,
      type: 'TRADE_STAKE',
      amount: -stake,
      currency: 'USD',
      referenceId: tradeId,
      description: `Binary option ${direction} on ${asset.pair} (${duration}s)`,
      status: 'COMPLETED',
      isDemo,
      createdAt: new Date(now).toISOString(),
    };
    db.update('transactions', [newTx, ...db.get('transactions')]);

    // 8. User notification
    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      userId: user.id,
      title: `Trade Placed: ${direction} on ${asset.pair}`,
      message: `Locked $${stake.toFixed(2)} at entry price ${entryPrice}. Expiry in ${duration}s.`,
      type: 'TRADE_OPEN',
      read: false,
      createdAt: new Date(now).toISOString(),
    };
    db.update('notifications', [notif, ...db.get('notifications')]);

    return { success: true, trade: newTrade };
  }

  private processExpiredTrades() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const now = Date.now();
      const trades = [...db.get('trades')];
      let hasUpdates = false;

      for (let i = 0; i < trades.length; i++) {
        const trade = trades[i];
        if (trade.status !== 'ACTIVE') continue;

        if (now >= trade.expiryTimestamp) {
          // Time to settle!
          const currentPrice = marketService.getCurrentPrice(trade.assetId);
          if (currentPrice === null) continue;

          this.settleTrade(trade, currentPrice);
          hasUpdates = true;
        }
      }

      if (hasUpdates) {
        // DB update handled in settleTrade
      }
    } catch (err) {
      console.error('Error during trade settlement cycle:', err);
    } finally {
      this.isProcessing = false;
    }
  }

  private settleTrade(trade: BinaryTrade, expiryPrice: number) {
    const entryPrice = trade.entryPrice;
    let result: 'WON' | 'LOST' | 'TIE' = 'LOST';
    let actualPayout = 0;
    let formulaDesc = '';

    if (trade.direction === 'UP') {
      if (expiryPrice > entryPrice) {
        result = 'WON';
        actualPayout = trade.potentialPayout;
        formulaDesc = `Expiry (${expiryPrice}) > Entry (${entryPrice}) -> UP WIN. Payout: $${actualPayout.toFixed(2)}`;
      } else if (expiryPrice === entryPrice) {
        result = 'TIE';
        actualPayout = trade.stake; // tie refund
        formulaDesc = `Expiry (${expiryPrice}) == Entry (${entryPrice}) -> TIE. Stake refund: $${actualPayout.toFixed(2)}`;
      } else {
        result = 'LOST';
        actualPayout = 0;
        formulaDesc = `Expiry (${expiryPrice}) < Entry (${entryPrice}) -> UP LOSS. Stake retained.`;
      }
    } else {
      // DOWN
      if (expiryPrice < entryPrice) {
        result = 'WON';
        actualPayout = trade.potentialPayout;
        formulaDesc = `Expiry (${expiryPrice}) < Entry (${entryPrice}) -> DOWN WIN. Payout: $${actualPayout.toFixed(2)}`;
      } else if (expiryPrice === entryPrice) {
        result = 'TIE';
        actualPayout = trade.stake;
        formulaDesc = `Expiry (${expiryPrice}) == Entry (${entryPrice}) -> TIE. Stake refund: $${actualPayout.toFixed(2)}`;
      } else {
        result = 'LOST';
        actualPayout = 0;
        formulaDesc = `Expiry (${expiryPrice}) > Entry (${entryPrice}) -> DOWN LOSS. Stake retained.`;
      }
    }

    const now = Date.now();
    const marketStatus = marketService.getMarketStatus();
    const dataSourceLabel = `${marketStatus.dataSource}:${trade.symbol}`;

    // Update trade record
    trade.status = result;
    trade.expiryPrice = expiryPrice;
    trade.actualPayout = actualPayout;
    trade.settlementTimestamp = now;
    trade.settlementReason = formulaDesc;
    trade.settlementSource = dataSourceLabel;

    const allTrades = db.get('trades').map((t) => (t.id === trade.id ? trade : t));
    db.update('trades', allTrades);

    // Create immutable audit settlement record
    const settlementRecord: TradeSettlement = {
      id: `SET-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
      tradeId: trade.id,
      userId: trade.userId,
      symbol: trade.symbol,
      direction: trade.direction,
      stake: trade.stake,
      entryPrice,
      expiryPrice,
      result,
      payout: actualPayout,
      payoutRate: trade.payoutRate,
      marketDataSource: dataSourceLabel,
      settledAt: new Date(now).toISOString(),
      deterministicFormula: formulaDesc,
    };
    db.update('settlements', [settlementRecord, ...db.get('settlements')]);

    // Update user balance
    const users = [...db.get('users')];
    const userIndex = users.findIndex((u) => u.id === trade.userId);
    if (userIndex !== -1) {
      const user = users[userIndex];
      if (trade.isDemo) {
        user.demoBalance = Number((user.demoBalance + actualPayout).toFixed(2));
      } else {
        user.lockedBalance = Math.max(0, Number((user.lockedBalance - trade.stake).toFixed(2)));
        user.realBalance = Number((user.realBalance + actualPayout).toFixed(2));
      }
      users[userIndex] = user;
      db.update('users', users);
    }

    // Add transaction if payout > 0
    if (actualPayout > 0) {
      const payoutTx: WalletTransaction = {
        id: `TX-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
        userId: trade.userId,
        type: 'TRADE_PAYOUT',
        amount: actualPayout,
        currency: 'USD',
        referenceId: trade.id,
        description: `Binary ${result} payout on ${trade.pair} (${trade.direction})`,
        status: 'COMPLETED',
        isDemo: trade.isDemo,
        createdAt: new Date(now).toISOString(),
      };
      db.update('transactions', [payoutTx, ...db.get('transactions')]);
    }

    // Notification for user
    const notifTitle = result === 'WON' ? `Trade WON! +$${actualPayout.toFixed(2)}` : result === 'TIE' ? 'Trade Settled as TIE' : 'Trade Settled (Loss)';
    const notifMsg = `${trade.direction} on ${trade.pair} expired at ${expiryPrice}. ${formulaDesc}`;
    const userNotif: NotificationItem = {
      id: `NOTIF-${now}`,
      userId: trade.userId,
      title: notifTitle,
      message: notifMsg,
      type: result === 'WON' ? 'TRADE_WON' : 'TRADE_LOST',
      read: false,
      createdAt: new Date(now).toISOString(),
    };
    db.update('notifications', [userNotif, ...db.get('notifications')]);
  }
}

export const tradeEngine = new TradeEngine();
