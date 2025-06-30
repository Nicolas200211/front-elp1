import { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import './Login.css';

// Lazy load the Orb component
const Orb = lazy(() => import('../../components/Orb'));

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Por favor ingrese su correo y contraseña');
      return;
    }

    try {
      setLoading(true);
      // Llamar a la función de login del AuthContext
      const response = await login(email, password);
      
      // Verificar si la respuesta es exitosa
      if (response && response.user) {
        // Mostrar mensaje de éxito
        toast.success('Inicio de sesión exitoso');
        // La navegación se manejará en el AuthContext
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      // Limpiar el campo de contraseña en caso de error
      setPassword('');
      
      // Mostrar mensaje de error apropiado
      let errorMessage = 'Error al iniciar sesión. Por favor, intente nuevamente.';
      
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage = 'Credenciales inválidas. Por favor, verifique su correo y contraseña.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Error de conexión. Por favor, verifique su conexión a internet.';
        } else {
          errorMessage = error.message || errorMessage;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para manejar la animación de entrada
  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelectorAll('.animate-on-load').forEach((el) => {
        el.classList.add('animate-visible');
      });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Función para animar texto letra por letra
  const AnimatedText = ({ text, className = '' }: { text: string; className?: string }) => {
    return (
      <div className={`inline-flex ${className}`}>
        {text.split('').map((char, i) => (
          <span 
            key={i} 
            className="inline-block opacity-0 translate-y-2 animate-fadeInUp"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      {/* Contenedor principal con imagen y formulario */}
      <div className="w-full max-w-6xl min-h-[600px] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Sección del Orb 3D */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-600 p-8 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Suspense fallback={<div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600" />}>
              <Orb 
                hue={700} 
                hoverIntensity={0.5} 
                rotateOnHover={true}
                forceHoverState={false}
              />
            </Suspense>
          </div>
          <div className="relative z-10 text-center text-white p-8 bg-black/20 backdrop-blur-sm rounded-2xl">
            <h2 className="text-3xl font-bold mb-4 text-white/90">Bienvenido administrador</h2>
            <p className="text-lg text-white/80">Inicia sesión para acceder a tu cuenta</p>
          </div>
        </div>
      {/* Sección del formulario */}
      <div className="w-full md:w-1/2 p-6 md:p-10 opacity-0 translate-y-6 transition-all duration-500 animate-on-load">
        <div className="max-w-md mx-auto">
          <div className="px-8 py-10 sm:px-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                <AnimatedText text="Bienvenido de nuevo" className="inline-block" />
              </h2>
              <p className="text-gray-600">
                <AnimatedText text="Inicia sesión para continuar" className="inline-block" />
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Contraseña
                  </label>
                </div>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
              <div className="hover-scale transition-transform duration-300">
                <button
                  type="submit"
                  disabled={loading}
                  className={`group w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Iniciando sesión...</span>
                    </div>
                  ) : (
                    <span className="flex items-center hover-arrow">
                      <span>Iniciar sesión</span>
                      <FiArrowRight className="ml-2 h-4 w-4 arrow-transition" />
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Login;
