import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

// Layout
const Layout = ({ children, role }: { children: React.ReactNode, role: string }) => (
  <div className="min-h-screen bg-gray-50">
    <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-primary-600">RealFast Claims</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500 uppercase font-semibold tracking-wider">Role: {role}</span>
        <button className="text-sm text-red-600 hover:underline">Logout</button>
      </div>
    </nav>
    <main className="p-6">{children}</main>
  </div>
);

// Pages (Stubs)
const MemberDashboard = () => <Layout role="MEMBER"><div>TODO: MemberDashboard</div></Layout>;
const ProviderDashboard = () => <Layout role="PROVIDER"><div>TODO: ProviderDashboard</div></Layout>;
const AdjudicatorDashboard = () => <Layout role="ADJUDICATOR"><div>TODO: AdjudicatorDashboard</div></Layout>;
const AdminDashboard = () => <Layout role="ADMIN"><div>TODO: AdminDashboard</div></Layout>;
const Login = () => <div className="p-10">TODO: LoginPage</div>;

function App() {
  const [role] = useState<'MEMBER' | 'PROVIDER' | 'ADJUDICATOR' | 'ADMIN'>('MEMBER');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes (Stubs) */}
        <Route path="/member/*" element={role === 'MEMBER' ? <MemberDashboard /> : <Navigate to="/login" />} />
        <Route path="/provider/*" element={role === 'PROVIDER' ? <ProviderDashboard /> : <Navigate to="/login" />} />
        <Route path="/adjudicator/*" element={role === 'ADJUDICATOR' ? <AdjudicatorDashboard /> : <Navigate to="/login" />} />
        <Route path="/admin/*" element={role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/login" />} />
        
        <Route path="/" element={<Navigate to={`/${role.toLowerCase()}`} />} />
      </Routes>
    </Router>
  );
}

export default App;
