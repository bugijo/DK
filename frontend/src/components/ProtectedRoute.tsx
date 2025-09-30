import { useAuthContext } from '../contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { Layout } from './Layout';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthContext();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Se não está autenticado, redireciona para a página de login
    return <Navigate to="/login" replace />;
  }

  // Se está autenticado, renderiza a página solicitada com layout
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}