import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MainLayout from './components/layout/MainLayout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/auth/Login';
import DashboardPage from './pages/Dashboard';
import AsignaturasPage from './pages/asignaturas';
import UnidadesAcademicasPage from './pages/unidades-academicas';
import DocentesPage from './pages/docentes';
import AulasPage from './pages/aulas';
import GruposPage from './pages/grupos';
import MatriculasPage from './pages/matriculas';
import EstudiantesPage from './pages/estudiantes';
import ProgramacionHorariosPage from './pages/programacion-horarios';
import ProgramacionGeneralPage from './pages/programacion-general';
import CiclosPage from './pages/ciclos';

const NotFoundPage: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-64">
    <h1 className="text-4xl font-bold text-gray-900">404</h1>
    <p className="mt-2 text-lg text-gray-600">Página no encontrada</p>
  </div>
);

// Componente de carga
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

// Componente para proteger rutas que requieren autenticación
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente para rutas públicas
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Componente principal de la aplicación
const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="asignaturas/*" element={<AsignaturasPage />} />
                <Route path="unidades-academicas" element={<UnidadesAcademicasPage />} />
                <Route path="docentes" element={<DocentesPage />} />
                <Route path="aulas" element={<AulasPage />} />
                <Route path="grupos" element={<GruposPage />} />
                <Route path="matriculas" element={<MatriculasPage />} />
                <Route path="estudiantes" element={<EstudiantesPage />} />
                <Route path="programacion-horarios" element={<ProgramacionHorariosPage />} />
                <Route path="programacion-general" element={<ProgramacionGeneralPage />} />
                <Route path="ciclos" element={<CiclosPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

// Componente raíz de la aplicación
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <AppContent />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
