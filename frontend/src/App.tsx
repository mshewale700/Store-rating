import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { useRealTime } from './hooks/useRealTime';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserDashboard } from './pages/UserDashboard';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { Profile } from './pages/Profile';
import { NotFound } from './pages/NotFound';
import { Unauthorized } from './pages/Unauthorized';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 30,
    },
  },
});

function RealTimeManager() {
  const socket = useRealTime();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;
    socket.on('data_change', (payload) => {
      console.log('Real-time data change:', payload);
      // Invalidate queries so that the UI fetches fresh data
      queryClient.invalidateQueries();
    });
    return () => {
      socket.off('data_change');
    };
  }, [socket, queryClient]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RealTimeManager />
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected layout shell — all authenticated routes nest here */}
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route
                  path="/admin-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['USER']}>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/owner-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['STORE_OWNER']}>
                      <OwnerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* Root redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Catch-all 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
