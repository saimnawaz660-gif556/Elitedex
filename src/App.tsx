import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { MarketProvider } from './context/MarketContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { MarketsPage } from './pages/MarketsPage';
import { TradingPage } from './pages/TradingPage';
import { DashboardPage } from './pages/DashboardPage';
import { TradesHistoryPage } from './pages/TradesHistoryPage';
import { WalletPage } from './pages/WalletPage';
import { DepositPage } from './pages/DepositPage';
import { WithdrawPage } from './pages/WithdrawPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { ReferralsPage } from './pages/ReferralsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SupportPage } from './pages/SupportPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import {
  HowItWorksPage,
  AboutPage,
  TermsPage,
  PrivacyPage,
  RiskDisclosurePage,
} from './pages/LegalPages';
import { AdminPanel } from './pages/admin/AdminPanel';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdminRoute = currentPath.startsWith('/admin');

  const renderContent = () => {
    switch (currentPath) {
      case '/':
        return <LandingPage onNavigate={navigate} />;
      case '/markets':
        return <MarketsPage onNavigate={navigate} />;
      case '/trade':
        return <TradingPage />;
      case '/dashboard':
        return <DashboardPage onNavigate={navigate} />;
      case '/trades':
        return <TradesHistoryPage onNavigate={navigate} />;
      case '/wallet':
        return <WalletPage onNavigate={navigate} />;
      case '/deposit':
        return <DepositPage onNavigate={navigate} />;
      case '/withdraw':
        return <WithdrawPage onNavigate={navigate} />;
      case '/transactions':
        return <TransactionsPage />;
      case '/referrals':
        return <ReferralsPage />;
      case '/notifications':
        return <NotificationsPage />;
      case '/support':
        return <SupportPage />;
      case '/profile':
      case '/settings':
        return <ProfilePage />;
      case '/login':
        return <LoginPage onNavigate={navigate} />;
      case '/register':
        return <RegisterPage onNavigate={navigate} />;
      case '/how-it-works':
        return <HowItWorksPage onNavigate={navigate} />;
      case '/about':
        return <AboutPage />;
      case '/terms':
        return <TermsPage />;
      case '/privacy':
        return <PrivacyPage />;
      case '/risk-disclosure':
        return <RiskDisclosurePage />;
      default:
        if (isAdminRoute) {
          return <AdminPanel onNavigate={navigate} />;
        }
        return <LandingPage onNavigate={navigate} />;
    }
  };

  return (
    <AuthProvider>
      <MarketProvider>
        <div className="min-h-screen flex flex-col bg-[#070b13] text-slate-100">
          <Navbar currentPath={currentPath} onNavigate={navigate} />
          <div className="flex-1 flex flex-col">{renderContent()}</div>
          {!isAdminRoute && <Footer onNavigate={navigate} />}
        </div>
      </MarketProvider>
    </AuthProvider>
  );
}
