import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useMarket } from '../../context/MarketContext';
import { useAuth } from '../../context/AuthContext';
import { Candle, BinaryTrade } from '../../types';
import { CandlestickChart, LineChart, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

export const TradingChart: React.FC<{ symbol?: string }> = ({ symbol }) => {
  const {
    selectedAsset,
    candles,
    timeframe,
    setTimeframe,
    chartType,
    setChartType,
    marketStatus,
  } = useMarket();
  const { activeTrades } = useAuth();

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1 = default, 1.5 = zoom in, 0.7 = zoom out

  // Filter active trades for currently selected asset
  const relevantTrades = activeTrades.filter(
    (t) => selectedAsset && (t.assetId === selectedAsset.id || t.symbol === selectedAsset.symbol)
  );

  const renderChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !candles || candles.length === 0 || !selectedAsset) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Padding for axes
    const padding = { top: 30, right: 75, bottom: 35, left: 15 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    if (chartW <= 0 || chartH <= 0) {
      ctx.restore();
      return;
    }

    // Determine slice of visible candles based on zoom
    const maxVisibleCandles = Math.max(15, Math.floor((width / 12) / zoomLevel));
    const visibleCandles = candles.slice(-maxVisibleCandles);

    // Calculate price bounds
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    for (const c of visibleCandles) {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
    }

    // Include active trade entry prices in bounds so they don't clip
    for (const t of relevantTrades) {
      if (t.entryPrice < minPrice) minPrice = t.entryPrice;
      if (t.entryPrice > maxPrice) maxPrice = t.entryPrice;
    }

    // Include current price
    if (selectedAsset.currentPrice < minPrice) minPrice = selectedAsset.currentPrice;
    if (selectedAsset.currentPrice > maxPrice) maxPrice = selectedAsset.currentPrice;

    // Buffer margin
    const priceDelta = maxPrice - minPrice || selectedAsset.currentPrice * 0.01;
    minPrice -= priceDelta * 0.08;
    maxPrice += priceDelta * 0.08;

    const priceToY = (price: number) => {
      return padding.top + chartH - ((price - minPrice) / (maxPrice - minPrice)) * chartH;
    };

    const yToPrice = (y: number) => {
      const norm = (padding.top + chartH - y) / chartH;
      return minPrice + norm * (maxPrice - minPrice);
    };

    // Candle horizontal spacing
    const candleCount = visibleCandles.length;
    const candleWidth = Math.max(3, (chartW / candleCount) * 0.7);
    const candleSpacing = chartW / candleCount;

    const candleToX = (index: number) => {
      return padding.left + index * candleSpacing + candleSpacing / 2;
    };

    // 1. Draw subtle background horizontal grid lines & prices on right
    const gridLines = 6;
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartH / gridLines) * i;
      const priceAtY = yToPrice(y);

      ctx.beginPath();
      ctx.setLineDash([3, 3]);
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Right axis price label
      ctx.fillText(formatPrice(priceAtY, selectedAsset.currentPrice), width - padding.right + 8, y);
    }
    ctx.setLineDash([]);

    // 2. Draw vertical time grid lines & timestamps
    const timeStep = Math.max(1, Math.floor(candleCount / 6));
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let i = 0; i < candleCount; i += timeStep) {
      const x = candleToX(i);
      const candle = visibleCandles[i];
      const date = new Date(candle.time * 1000);
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      ctx.beginPath();
      ctx.setLineDash([2, 4]);
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.3)';
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();

      ctx.fillText(timeStr, x, height - padding.bottom + 8);
    }
    ctx.setLineDash([]);

    // 3. Render Chart (Candlestick or Line)
    if (chartType === 'candle') {
      for (let i = 0; i < candleCount; i++) {
        const c = visibleCandles[i];
        const x = candleToX(i);
        const openY = priceToY(c.open);
        const closeY = priceToY(c.close);
        const highY = priceToY(c.high);
        const lowY = priceToY(c.low);

        const isBullish = c.close >= c.open;
        const color = isBullish ? '#10b981' : '#f43f5e';

        // Draw Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Draw Body
        ctx.fillStyle = color;
        const bodyY = Math.min(openY, closeY);
        const bodyHeight = Math.max(1.5, Math.abs(closeY - openY));
        ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight);
      }
    } else {
      // Line Chart mode with gradient fill
      ctx.beginPath();
      for (let i = 0; i < candleCount; i++) {
        const x = candleToX(i);
        const y = priceToY(visibleCandles[i].close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Area fill
      const lastX = candleToX(candleCount - 1);
      const firstX = candleToX(0);
      ctx.lineTo(lastX, height - padding.bottom);
      ctx.lineTo(firstX, height - padding.bottom);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // 4. Live Current Market Price Beam & Tag
    const curPriceY = priceToY(selectedAsset.currentPrice);

    ctx.beginPath();
    ctx.setLineDash([4, 2]);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.2;
    ctx.moveTo(padding.left, curPriceY);
    ctx.lineTo(width - padding.right, curPriceY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Live dot
    const lastCandleX = candleToX(candleCount - 1);
    ctx.beginPath();
    ctx.arc(lastCandleX, curPriceY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Live Price Tag on Right Axis
    ctx.fillStyle = '#10b981';
    const tagH = 18;
    const tagW = padding.right - 8;
    ctx.fillRect(width - padding.right, curPriceY - tagH / 2, tagW, tagH);

    ctx.fillStyle = '#090d16';
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(formatPrice(selectedAsset.currentPrice, selectedAsset.currentPrice), width - padding.right + tagW / 2, curPriceY);

    // 5. Active Binary Trades Markers (Entry Line & Countdown)
    for (const trade of relevantTrades) {
      const entryY = priceToY(trade.entryPrice);
      const isUp = trade.direction === 'UP';
      const tradeColor = isUp ? '#10b981' : '#f43f5e';

      // Entry Price Horizontal Marker
      ctx.beginPath();
      ctx.setLineDash([6, 3]);
      ctx.strokeStyle = tradeColor;
      ctx.lineWidth = 1.8;
      ctx.moveTo(padding.left, entryY);
      ctx.lineTo(width - padding.right, entryY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Entry badge on left/center
      const badgeText = `${isUp ? '▲ UP' : '▼ DOWN'} $${trade.stake} @ ${formatPrice(trade.entryPrice, trade.entryPrice)}`;
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      const textWidth = ctx.measureText(badgeText).width;

      ctx.fillStyle = isUp ? 'rgba(16, 185, 129, 0.9)' : 'rgba(244, 63, 94, 0.9)';
      ctx.fillRect(padding.left + 10, entryY - 11, textWidth + 12, 20);

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, padding.left + 16, entryY - 1);

      // Remaining seconds countdown
      const remainingSec = Math.max(0, Math.ceil((trade.expiryTimestamp - Date.now()) / 1000));
      const countdownText = `${remainingSec}s`;
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillText(`⏱ ${countdownText}`, padding.left + textWidth + 30, entryY - 1);
    }

    // 6. Crosshair on Mouse Hover
    if (mousePos && mousePos.x >= padding.left && mousePos.x <= width - padding.right && mousePos.y >= padding.top && mousePos.y <= height - padding.bottom) {
      ctx.beginPath();
      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.lineWidth = 1;

      // Vertical
      ctx.moveTo(mousePos.x, padding.top);
      ctx.lineTo(mousePos.x, height - padding.bottom);
      // Horizontal
      ctx.moveTo(padding.left, mousePos.y);
      ctx.lineTo(width - padding.right, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Crosshair Price Tag on Right
      const hoveredPrice = yToPrice(mousePos.y);
      ctx.fillStyle = '#334155';
      ctx.fillRect(width - padding.right, mousePos.y - 9, padding.right - 8, 18);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(formatPrice(hoveredPrice, selectedAsset.currentPrice), width - padding.right + (padding.right - 8) / 2, mousePos.y);
    }

    ctx.restore();
  }, [candles, selectedAsset, timeframe, chartType, relevantTrades, zoomLevel, mousePos]);

  // Handle Canvas Resizing
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      renderChart();
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [renderChart]);

  // Re-render when dependencies change
  useEffect(() => {
    renderChart();
  }, [renderChart]);

  // Mouse Move Crosshair & Tooltip
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !candles || candles.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    // Find nearest candle
    const paddingLeft = 15;
    const paddingRight = 75;
    const chartW = rect.width - paddingLeft - paddingRight;
    const maxVisibleCandles = Math.max(15, Math.floor((rect.width / 12) / zoomLevel));
    const visibleCandles = candles.slice(-maxVisibleCandles);

    if (x >= paddingLeft && x <= rect.width - paddingRight) {
      const candleIndex = Math.floor(((x - paddingLeft) / chartW) * visibleCandles.length);
      if (candleIndex >= 0 && candleIndex < visibleCandles.length) {
        setHoveredCandle(visibleCandles[candleIndex]);
      } else {
        setHoveredCandle(null);
      }
    } else {
      setHoveredCandle(null);
    }
  };

  const handleMouseLeave = () => {
    setMousePos(null);
    setHoveredCandle(null);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden select-none">
      {/* Chart Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
        {/* Left: Asset Details & OHLC HUD */}
        <div className="flex items-center gap-3">
          {selectedAsset && (
            <div className="flex items-center gap-2">
              <img
                src={selectedAsset.logo}
                alt={selectedAsset.symbol}
                className="w-5 h-5 rounded-full"
                referrerPolicy="no-referrer"
              />
              <span className="font-bold text-slate-100 text-sm tracking-tight">{selectedAsset.pair}</span>
              <span className="font-mono tabular-nums text-sm font-bold text-white">
                ${selectedAsset.currentPrice.toLocaleString('en-US', {
                  minimumFractionDigits: selectedAsset.currentPrice < 1 ? 4 : 2,
                  maximumFractionDigits: selectedAsset.currentPrice < 1 ? 4 : 2,
                })}
              </span>
              <span
                className={`text-[11px] font-mono tabular-nums font-semibold px-1.5 py-0.5 rounded ${
                  selectedAsset.change24h >= 0 ? 'text-emerald-400 bg-emerald-950/40' : 'text-rose-400 bg-rose-950/40'
                }`}
              >
                {selectedAsset.change24h >= 0 ? '+' : ''}
                {selectedAsset.change24h.toFixed(2)}%
              </span>
            </div>
          )}

          {/* Candle HUD Display */}
          {hoveredCandle && (
            <div className="hidden xl:flex items-center gap-2.5 text-[11px] font-mono tabular-nums text-slate-400 ml-3 pl-3 border-l border-slate-800">
              <span>O: <strong className="text-slate-200">{hoveredCandle.open}</strong></span>
              <span>H: <strong className="text-slate-200">{hoveredCandle.high}</strong></span>
              <span>L: <strong className="text-slate-200">{hoveredCandle.low}</strong></span>
              <span>C: <strong className="text-slate-200">{hoveredCandle.close}</strong></span>
            </div>
          )}
        </div>

        {/* Right: Timeframe, Chart Style, Zoom & Market Status */}
        <div className="flex items-center gap-2">
          {/* Timeframe Selector */}
          <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
            {(['1m', '5m', '15m'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                  timeframe === tf ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
            <button
              onClick={() => setChartType('candle')}
              title="Candlestick Chart"
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                chartType === 'candle' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CandlestickChart className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('line')}
              title="Area Line Chart"
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                chartType === 'line' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
              title="Zoom In"
              className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded border border-slate-800 cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.25))}
              title="Zoom Out"
              className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded border border-slate-800 cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Market Feed Status */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                marketStatus.isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>{marketStatus.isLive ? 'BINANCE' : 'SIMULATED'}</span>
          </div>
        </div>
      </div>

      {/* Main Chart Canvas Area */}
      <div ref={containerRef} className="relative flex-1 w-full min-h-[380px] bg-[#070b13]">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="absolute inset-0 w-full h-full cursor-crosshair"
        />
      </div>
    </div>
  );
};

function formatPrice(val: number, refPrice: number): string {
  if (refPrice < 1) return val.toFixed(4);
  if (refPrice < 10) return val.toFixed(3);
  return val.toFixed(2);
}
