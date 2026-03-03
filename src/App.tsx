import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import MapView from './pages/MapView';
import Shipments from './pages/Shipments';
import Verify from './pages/Verify';
import SecretAccess from './pages/SecretAccess';
import AnimatedBackground from './components/AnimatedBackground';
import { connectWallet, disconnectWallet, reconnectSession } from './services/walletService';

// Role-based navigation config
const ALL_NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '', roles: ['supplier', 'distributor', 'analyst'] },
  { path: '/shipments', label: 'Shipments', icon: '', roles: ['supplier', 'distributor', 'analyst'] },
  { path: '/alerts', label: 'Alerts', icon: '', roles: ['distributor', 'analyst'] },
  { path: '/analytics', label: 'Analytics', icon: '', roles: ['analyst'] },
  { path: '/map', label: 'Map', icon: '', roles: ['supplier', 'distributor', 'analyst'] },
  { path: '/verify', label: 'Verify', icon: '', roles: ['supplier', 'distributor', 'analyst', 'public'] },
  { path: '/secret-access', label: 'Secret (402)', icon: '', roles: ['supplier', 'distributor', 'analyst', 'public'] },
];

// Default landing per role
const ROLE_DEFAULT: Record<string, string> = {
  supplier: '/',
  distributor: '/',
  analyst: '/',
  public: '/verify',
};

export default function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [role, setRole] = useState<string>('analyst');

  useEffect(() => {
    reconnectSession().then((accounts) => {
      if (accounts.length > 0) setWalletAddress(accounts[0]);
    });
  }, []);

  const handleConnect = async () => {
    try {
      const accounts = await connectWallet();
      setWalletAddress(accounts[0]);
    } catch { /* user cancelled */ }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    setWalletAddress(null);
  };

  // Filter nav items by current role
  const navItems = ALL_NAV_ITEMS.filter(item => item.roles.includes(role));

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden relative">
        <AnimatedBackground />
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-sentinel-800/80 backdrop-blur-md border-r border-sentinel-700 flex flex-col transition-all duration-300 shrink-0 z-10 relative`}>
          <div className="p-4 border-b border-sentinel-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-algo-teal flex items-center justify-center text-sm font-bold">
                AR
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="text-sm font-bold text-white">AlgoRisk Sentinel</h1>
                  <p className="text-xs text-sentinel-400">Supply Chain Monitor</p>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {navItems.map(({ path, label, icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${isActive
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'text-sentinel-400 hover:text-white hover:bg-sentinel-700'
                  }`
                }
              >
                <span>{icon}</span>
                {sidebarOpen && <span>{label}</span>}
              </NavLink>
            ))}
          </nav>

          {/* Role selector */}
          {sidebarOpen && (
            <div className="p-3 border-t border-sentinel-700">
              <label className="text-xs text-sentinel-400 mb-1 block">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-sentinel-700 text-white text-xs p-2 rounded-lg border border-sentinel-600 focus:outline-none focus:border-accent"
              >
                <option value="supplier">Supplier</option>
                <option value="distributor">Distributor</option>
                <option value="analyst">Analyst</option>
                <option value="public">Public</option>
              </select>
              {/* Role description */}
              <p className="text-[10px] text-sentinel-500 mt-1.5">
                {role === 'supplier' && 'Create & track shipments'}
                {role === 'distributor' && 'Monitor shipments & view alerts'}
                {role === 'analyst' && 'Full access + premium analytics'}
                {role === 'public' && 'Verify alerts on blockchain'}
              </p>
            </div>
          )}
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden z-10 relative">
          {/* Top bar */}
          <header className="h-14 bg-sentinel-800/80 backdrop-blur-md border-b border-sentinel-700 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-sentinel-400 hover:text-white p-1"
              >
                ☰
              </button>
              <span className="text-sm text-sentinel-400">
                Algorand TestNet •{' '}
                <span className="text-algo-teal">● Connected</span>
              </span>
              <span className="text-xs bg-sentinel-700 px-2 py-0.5 rounded-md text-sentinel-400 capitalize">
                {role}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {walletAddress ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-sentinel-700 px-3 py-1.5 rounded-lg text-sentinel-400 font-mono">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                  <button
                    onClick={handleDisconnect}
                    className="text-xs bg-risk-high/20 text-risk-high px-3 py-1.5 rounded-lg hover:bg-risk-high/30 transition"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnect}
                  className="text-xs bg-gradient-to-r from-accent to-algo-teal text-sentinel-900 font-semibold px-4 py-1.5 rounded-lg hover:opacity-90 transition"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6 bg-sentinel-900/60 backdrop-blur-sm">
            <Routes>
              <Route path="/" element={
                ['supplier', 'distributor', 'analyst'].includes(role)
                  ? <Dashboard role={role} />
                  : <Navigate to={ROLE_DEFAULT[role] || '/verify'} replace />
              } />
              <Route path="/shipments" element={
                ['supplier', 'distributor', 'analyst'].includes(role)
                  ? <Shipments role={role} />
                  : <Navigate to={ROLE_DEFAULT[role] || '/verify'} replace />
              } />
              <Route path="/alerts" element={
                ['distributor', 'analyst'].includes(role)
                  ? <Alerts walletAddress={walletAddress} role={role} />
                  : <Navigate to={ROLE_DEFAULT[role] || '/verify'} replace />
              } />
              <Route path="/analytics" element={
                role === 'analyst'
                  ? <Analytics />
                  : <Navigate to={ROLE_DEFAULT[role] || '/verify'} replace />
              } />
              <Route path="/map" element={
                ['supplier', 'distributor', 'analyst'].includes(role)
                  ? <MapView />
                  : <Navigate to={ROLE_DEFAULT[role] || '/verify'} replace />
              } />
              <Route path="/verify" element={<Verify />} />
              <Route path="/secret-access" element={<SecretAccess />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
