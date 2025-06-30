# 🎓 Sistema de Gestión Académica - Frontend

Aplicación web moderna desarrollada con React y TypeScript para la gestión integral de recursos académicos, diseñada para facilitar la administración de aulas, horarios y recursos educativos.

## 🎯 Objetivo del Proyecto

Desarrollar una solución tecnológica que optimice la gestión de recursos académicos, mejorando la eficiencia en la asignación de aulas, programación de horarios y administración de la información académica.

## ✨ Características Destacadas

### 🏫 Gestión de Aulas
- Creación y edición de aulas con múltiples atributos
- Búsqueda y filtrado avanzado
- Visualización detallada de disponibilidad
- Gestión de estados (Disponible, En Mantenimiento, Ocupado)

### 📅 Programación de Horarios
- Interfaz intuitiva para asignación de horarios
- Visualización semanal/mensual
- Prevención de conflictos de horario
- Gestión de disponibilidad de aulas

### 🔐 Autenticación y Autorización
- Sistema de inicio de sesión seguro
- Roles de usuario (Admin, Docente, Estudiante)
- Protección de rutas
- Gestión de sesiones

### 📱 Interfaz de Usuario
- Diseño responsivo
- Experiencia de usuario intuitiva
- Componentes accesibles
- Tema claro/oscuro

## 🛠️ Stack Tecnológico

### Frontend
- **React 19.1.0**: Biblioteca principal para la construcción de interfaces
- **TypeScript 5.8.3**: Tipado estático para mayor robustez
- **Vite 6.3.5**: Bundler y servidor de desarrollo ultrarrápido
- **Tailwind CSS 4.1.7**: Framework CSS utilitario
- **React Router 7.6.0**: Enrutamiento del lado del cliente
- **Headless UI 2.2.4**: Componentes UI accesibles
- **Heroicons 2.2.0**: Biblioteca de iconos
- **date-fns 4.1.0**: Manipulación de fechas

### Herramientas de Desarrollo
- **ESLint**: Análisis estático de código
- **Prettier**: Formateo de código consistente
- **Git**: Control de versiones
- **NPM/Yarn**: Gestión de paquetes

## 📁 Estructura del Proyecto

El proyecto sigue una arquitectura modular basada en características (feature-based), lo que facilita el mantenimiento y la escalabilidad:

```
src/
├── api/                      # Servicios API y configuración
│   ├── aulaService.ts        # Servicio para gestión de aulas
│   ├── authService.ts        # Servicio de autenticación
│   └── ...                   # Otros servicios
│
├── assets/                  # Recursos estáticos (imágenes, fuentes, etc.)
│   ├── images/              # Imágenes del proyecto
│   └── styles/              # Estilos globales
│
├── components/             # Componentes reutilizables
│   ├── aulas/               # Componentes para gestión de aulas
│   │   ├── AulaForm.tsx     # Formulario de aula
│   │   └── AulaTable.tsx    # Tabla de aulas
│   ├── programacion-horarios/ # Componentes de programación
│   └── ...
│
├── contexts/               # Contextos de React
│   ├── AuthContext.tsx      # Contexto de autenticación
│   └── ThemeContext.tsx     # Contexto de tema claro/oscuro
│
├── pages/                  # Páginas de la aplicación
│   ├── aulas/               # Vistas relacionadas con aulas
│   │   ├── index.tsx        # Listado de aulas
│   │   └── [id].tsx         # Detalle/edición de aula
│   └── ...
│
└── utils/                 # Utilidades y helpers
    ├── validators.ts       # Funciones de validación
    └── formatters.ts       # Funciones de formateo
```

## 🏆 Puntos Destacados de la Implementación

### 🎯 Arquitectura
- **Componentes Modulares**: Diseño basado en componentes reutilizables
- **Separación de Preocupaciones**: Lógica de negocio separada de la presentación
- **Gestión de Estado Eficiente**: Uso de Context API para estado global

### 🛠️ Características Técnicas
- **Tipado Estricto**: TypeScript para mayor robustez
- **Rendimiento Optimizado**: Carga diferida de rutas (lazy loading)
- **Validación de Formularios**: Implementación con React Hook Form
- **Diseño Responsive**: Adaptable a diferentes dispositivos
- **Accesibilidad**: Componentes accesibles (ARIA, teclado)

### 🔄 Flujos Principales
1. **Autenticación de Usuario**
   - Inicio de sesión seguro
   - Renovación de token
   - Control de rutas protegidas

2. **Gestión de Aulas**
   - Creación/edición de aulas
   - Búsqueda y filtrado
   - Gestión de estados

3. **Programación de Horarios**
   - Asignación de horarios
   - Prevención de conflictos
   - Visualización de disponibilidad

### 📊 Métricas de Calidad
- Cobertura de pruebas: En desarrollo
- Puntuación Lighthouse: Optimización en progreso
- Tiempo de carga: < 2s (objetivo)

### 🔍 Próximos Pasos
- [ ] Implementar pruebas unitarias
- [ ] Optimizar rendimiento
- [ ] Añadir documentación detallada
- [ ] Implementar modo offline
- [ ] Mejorar accesibilidad

## 🚀 Guía de Instalación y Configuración

### Requisitos Previos
- Node.js 18+ (recomendada la última versión LTS)
- npm 9+ o yarn 1.22+
- Git

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/front-elp1.git
   cd front-elp1
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Configurar variables de entorno**
   Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_APP_TITLE="Sistema ELP"
   VITE_DEFAULT_THEME=light
   ```

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   # o
   yarn dev
   ```
   La aplicación estará disponible en `http://localhost:5173`

## 🛠️ Guía de Desarrollo

### Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `dev` | Inicia el servidor de desarrollo con recarga en caliente |
| `build` | Construye la aplicación para producción |
| `preview` | Previsualiza la compilación de producción localmente |
| `lint` | Ejecuta ESLint para verificar la calidad del código |
| `format` | Formatea el código automáticamente |
| `type-check` | Verifica los tipos de TypeScript |

### Estructura de Componentes

#### AulaForm
Componente para la creación y edición de aulas con validación en tiempo real.

**Propiedades:**
- `initialData`: Datos iniciales del aula (opcional)
- `onSubmit`: Función que se ejecuta al enviar el formulario
- `isSubmitting`: Indica si el formulario está siendo enviado

**Uso:**
```tsx
<AulaForm 
  initialData={{ nombre: 'Aula 101', capacidad: 30 }}
  onSubmit={(data) => console.log(data)}
  isSubmitting={false}
/>
```

## 📚 Documentación Técnica

### Patrones de Diseño
- **Componentes Funcionales**: Uso de React Hooks para manejo de estado y efectos
- **Composición de Componentes**: Reutilización de componentes más pequeños
- **Renderizado Condicional**: Para mostrar/ocultar elementos según el estado

### Gestión de Estado
- **Context API**: Para estado global (autenticación, tema)
- **Estado Local**: Para componentes independientes
- **React Query**: Para manejo de datos del servidor (en implementación)

### Estilos
- **Tailwind CSS**: Utilidad-first CSS framework
- **Clases Condicionales**: Para estilos dinámicos
- **Temas**: Soporte para tema claro/oscuro

## ❓ Preguntas Frecuentes

### ¿Cómo agregar una nueva página?
1. Crea un nuevo archivo en la carpeta `pages`
2. Define la ruta en `App.tsx`
3. Crea los componentes necesarios en `components`

### ¿Cómo manejar las llamadas a la API?
Crea un nuevo servicio en la carpeta `api` siguiendo el patrón de los existentes.

### ¿Cómo contribuir al proyecto?
1. Haz fork del repositorio
2. Crea una rama con tu feature
3. Envía un Pull Request con una descripción detallada

## 📊 Estado del Proyecto

### Características Implementadas
- [x] Sistema de autenticación
- [x] Gestión de aulas
- [x] Programación de horarios
- [x] Diseño responsivo
- [x] Validación de formularios

### En Desarrollo
- [ ] Pruebas unitarias
- [ ] Documentación detallada
- [ ] Panel de administración
- [ ] Exportación de reportes

### Próximas Características
- [ ] Integración con calendario
- [ ] Notificaciones en tiempo real
- [ ] Panel de estadísticas
- [ ] Soporte offline

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor lee nuestra [guía de contribución](CONTRIBUTING.md) para más detalles sobre nuestro código de conducta y el proceso de envío de pull requests.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## ✨ Agradecimientos

- Equipo de desarrollo
- Comunidad de código abierto
- Tutores y asesores

---

Desarrollado por el equipo de desarrollo para el proyecto ELP1

  },
})
