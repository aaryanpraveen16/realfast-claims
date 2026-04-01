import { ReactNode } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { MemberRegister } from './pages/auth/MemberRegister';
import { ProviderRegister } from './pages/auth/ProviderRegister';
import { Dashboard as AdminDashboard } from './pages/admin/Dashboard';
import { Dashboard as MemberDashboard } from './pages/member/Dashboard';
import { Dashboard as ProviderDashboard } from './pages/provider/Dashboard';
import { Dashboard as AdjudicatorDashboard } from './pages/adjudicator/Dashboard';

// Shared Layout Component
export const Layout = ({ children, role }: { children: ReactNode, role: string }) => {
  const { logout, getUser } = useAuth();
  const user = getUser();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-bold text-primary-600">RealFast Claims</h1>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{role}</p>
            <p className="text-sm font-medium text-gray-900">{user?.userId.substring(0, 8)}...</p>
          </div>
          <button 
            onClick={logout}
            className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors px-3 py-1.5 border border-red-200 rounded-md hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="flex-grow p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles: string[] }) => {
  const { isLoggedIn, getRole } = useAuth();
  const location = useLocation();

  if (!isLoggedIn()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = getRole();
  if (role && !allowedRoles.includes(role)) {
    // Redirect to their own dashboard if they hit a wrong one
    const dashboardMap: Record<string, string> = {
      'MEMBER': '/member',
      'PROVIDER': '/provider',
      'ADJUDICATOR': '/adjudicator',
      'SUPER_ADMIN': '/admin'
    };
    return <Navigate to={dashboardMap[role] || '/'} replace />;
  }

  return children;
};

function App() {
  const { isLoggedIn, getRole } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={isLoggedIn() ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={isLoggedIn() ? <Navigate to="/" replace /> : <Register />} 
      />
      <Route 
        path="/register/member" 
        element={isLoggedIn() ? <Navigate to="/" replace /> : <MemberRegister />} 
      />
      <Route 
        path="/register/provider" 
        element={isLoggedIn() ? <Navigate to="/" replace /> : <ProviderRegister />} 
      />

      {/* Protected Member Routes */}
      <Route path="/member" element={
        <ProtectedRoute allowedRoles={['MEMBER']}>
          <Layout role="MEMBER"><MemberDashboard /></Layout>
        </ProtectedRoute>
      } />

      {/* Protected Provider Routes */}
      <Route path="/provider" element={
        <ProtectedRoute allowedRoles={['PROVIDER']}>
          <Layout role="PROVIDER"><ProviderDashboard /></Layout>
        </ProtectedRoute>
      } />

      {/* Protected Adjudicator Routes */}
      <Route path="/adjudicator" element={
        <ProtectedRoute allowedRoles={['ADJUDICATOR']}>
          <Layout role="ADJUDICATOR"><AdjudicatorDashboard /></Layout>
        </ProtectedRoute>
      } />

      {/* Protected Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
          <Layout role="SUPER_ADMIN"><AdminDashboard /></Layout>
        </ProtectedRoute>
      } />

      {/* Home Redirect based on role */}
      <Route path="/" element={
        isLoggedIn() ? (
          <Navigate to={`/${getRole()?.toLowerCase().replace('super_admin', 'admin')}`} replace />
        ) : (
          <Navigate to="/login" replace />
        )
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
