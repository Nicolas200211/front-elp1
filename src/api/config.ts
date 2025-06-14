// Configuración de la API para el sistema de gestión de horarios

// URL base de la API
const API_BASE_URL = 'http://localhost:3000/api';

// Endpoints de la API
export const API_ENDPOINTS = {
  // Ruta base
  BASE: API_BASE_URL,
  // Autenticación
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    PROFILE: `${API_BASE_URL}/auth/profile`,
    ADMIN: `${API_BASE_URL}/auth/admin`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
  },

  // Unidades Académicas
  UNIDADES_ACADEMICAS: {
    BASE: `${API_BASE_URL}/unidades-academicas`,
    BY_ID: (id: string | number) => `${API_BASE_URL}/unidades-academicas/${id}`,
    SEARCH: (query: string) => `${API_BASE_URL}/unidades-academicas/search?q=${encodeURIComponent(query)}`,
  },
  
  // Programas Académicos (mantenido por compatibilidad)
  ACADEMIC_UNITS: {
    BASE: `${API_BASE_URL}/academic-units`,
    BY_ID: (id: string) => `${API_BASE_URL}/academic-units/${id}`,
    PROGRAMS: (unitId: string) => `${API_BASE_URL}/academic-units/${unitId}/programs`,
  },

  // Programas Académicos
  PROGRAMS: {
    BASE: `${API_BASE_URL}/programs`,
    BY_ID: (id: string) => `${API_BASE_URL}/programs/${id}`,
    COURSES: (programId: string) => `${API_BASE_URL}/programs/${programId}/courses`,
  },

  // Asignaturas
  ASIGNATURAS: {
    BASE: `${API_BASE_URL}/asignaturas`,
    BY_ID: (id: string | number) => `${API_BASE_URL}/asignaturas/${id}`,
    BY_PROGRAMA: (programaId: string | number) => `${API_BASE_URL}/asignaturas/programa/${programaId}`,
    BY_DOCENTE: (docenteId: string | number) => `${API_BASE_URL}/asignaturas/docente/${docenteId}`,
  },

  // Cursos (mantenido por compatibilidad)
  COURSES: {
    BASE: `${API_BASE_URL}/courses`,
    BY_ID: (id: string) => `${API_BASE_URL}/courses/${id}`,
    PREREQUISITES: (courseId: string) => `${API_BASE_URL}/courses/${courseId}/prerequisites`,
  },

  // Ciclos Académicos
  CICLOS: {
    BASE: `${API_BASE_URL}/ciclos`,
    BY_ID: (id: string | number) => `${API_BASE_URL}/ciclos/${id}`,
    BY_ESTADO: (estado: string) => `${API_BASE_URL}/ciclos/estado/${estado}`,
    BY_ANIO: (anio: number) => `${API_BASE_URL}/ciclos/anio/${anio}`,
    ACTUAL: `${API_BASE_URL}/ciclos/actual`,
  },

  // Matrículas
  MATRICULAS: {
    BASE: `${API_BASE_URL}/matriculas`,
    BY_ID: (id: string | number) => `${API_BASE_URL}/matriculas/${id}`,
    BY_ESTUDIANTE: (idEstudiante: string | number) => `${API_BASE_URL}/matriculas/estudiante/${idEstudiante}`,
    BY_GRUPO: (idGrupo: string | number) => `${API_BASE_URL}/matriculas/grupo/${idGrupo}`,
    BUSCAR_POR_FECHA: `${API_BASE_URL}/matriculas/buscar-por-fecha`,
  },
  ESTUDIANTES: {
    BASE: `${API_BASE_URL}/estudiantes`,
    BY_ID: (id: string | number) => `${API_BASE_URL}/estudiantes/${id}`,
    BY_PROGRAMA: (idPrograma: string | number) => `${API_BASE_URL}/estudiantes/programa/${idPrograma}`,
    BY_CODIGO: (codigo: string) => `${API_BASE_URL}/estudiantes/codigo/${codigo}`,
    BY_DNI: (dni: string) => `${API_BASE_URL}/estudiantes/dni/${dni}`,
  },

  // Programación de Horarios
  PROGRAMACION_HORARIOS: {
    BASE: `${API_BASE_URL}/programacion-horarios`,
    BY_ID: (id: string | number) => `${API_BASE_URL}/programacion-horarios/${id}`,
    BY_GRUPO: (idGrupo: string | number) => `${API_BASE_URL}/programacion-horarios/grupo/${idGrupo}`,
    BY_DOCENTE: (idDocente: string | number) => `${API_BASE_URL}/programacion-horarios/docente/${idDocente}`,
  },
  
  PROGRAMACION_GENERAL: {
    BASE: `${API_BASE_URL}/programacion-general`,
    BY_ID: (id: string | number) => `${API_BASE_URL}/programacion-general/${id}`,
    BY_UNIDAD: (idUnidad: string | number) => `${API_BASE_URL}/programacion-general/unidad/${idUnidad}`,
    BY_ESTADO: (estado: string) => `${API_BASE_URL}/programacion-general/estado/${estado}`,
  },

  // Grupos
  GRUPOS: {
    BASE: `${API_BASE_URL}/grupos`,
    BY_ID: (id: string | number) => `${API_BASE_URL}/grupos/${id}`,
    SEARCH: (query: string) => `${API_BASE_URL}/grupos?q=${encodeURIComponent(query)}`,
    BY_PROGRAMA: (idPrograma: string | number) => `${API_BASE_URL}/grupos/programa/${idPrograma}`,
    BY_CICLO: (idCiclo: string | number) => `${API_BASE_URL}/grupos/ciclo/${idCiclo}`,
    BY_ESTADO: (estado: string) => `${API_BASE_URL}/grupos/estado/${estado}`,
  },

  // Aulas
  AULAS: {
    BASE: `${API_BASE_URL}/aulas`,
    BY_ID: (id: string | number) => `${API_BASE_URL}/aulas/${id}`,
    BY_CODIGO: (codigo: string) => `${API_BASE_URL}/aulas/codigo/${codigo}`,
    DISPONIBLES: `${API_BASE_URL}/aulas/disponibles`,
    DISPONIBILIDAD: (id: string | number) => `${API_BASE_URL}/aulas/${id}/disponibilidad`,
  },

  // Docentes
  DOCENTES: {
    BASE: `${API_BASE_URL}/docentes`,
    BY_ID: (id: string | number) => `${API_BASE_URL}/docentes/${id}`,
    SOBREASIGNACION: (id: string | number) => `${API_BASE_URL}/docentes/${id}/sobreasignacion`,
    SEARCH: (query: string) => `${API_BASE_URL}/docentes/search?q=${encodeURIComponent(query)}`,
  },

  // Horarios
  SCHEDULES: {
    BASE: `${API_BASE_URL}/schedules`,
    BY_ID: (id: string) => `${API_BASE_URL}/schedules/${id}`,
    GENERATE: `${API_BASE_URL}/schedules/generate`,
    VALIDATE: `${API_BASE_URL}/schedules/validate`,
    BY_COURSE: (courseId: string) => `${API_BASE_URL}/schedules/course/${courseId}`,
    BY_TEACHER: (teacherId: string) => `${API_BASE_URL}/schedules/teacher/${teacherId}`,
    BY_CLASSROOM: (classroomId: string) => `${API_BASE_URL}/schedules/classroom/${classroomId}`,
  },

  // Turnos
  SHIFTS: {
    BASE: `${API_BASE_URL}/shifts`,
    BY_ID: (id: string) => `${API_BASE_URL}/shifts/${id}`,
    TIME_SLOTS: (shiftId: string) => `${API_BASE_URL}/shifts/${shiftId}/time-slots`,
  },
};

// Interfaces para Tipado
export interface User {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  // Add other user properties as needed
}

export interface ProgramacionGeneral {
  id?: number;
  idUnidad: number;
  nombre: string;
  nivel: 'Inicial' | 'Primaria' | 'Secundaria' | 'Superior' | 'Profesional' | 'Técnico' | 'Idiomas' | 'Otro';
  unidad?: UnidadAcademica;
  fecha_creacion?: string;
  estado?: 'Activo' | 'Inactivo' | 'Borrador' | 'Finalizado';
}

export interface UnidadAcademica {
  id?: number;
  nombre: string;
  descripcion: string;
  codigo?: string;
}

export interface Grupo {
  id?: number;
  nombre: string;
  capacidad: number;
  idCiclo: number;
  idPrograma: number;
  estado: 'Activo' | 'Inactivo' | 'Completado' | 'Cancelado';
  fechaInicio?: string;
  fechaFin?: string;
  programa?: Programa;
  ciclo?: Ciclo;
  docente?: Docente;
  // Campos adicionales para compatibilidad
  codigo?: string;  // Agregado para compatibilidad
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    nombre: string;
    rol: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Ciclo {
  id?: number;
  anio: number;
  periodo: 'I' | 'II' | 'Extra';
  createdAt?: string;
  updatedAt?: string;
}

export interface Programa {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  idUnidad: number;
  estado: 'Activo' | 'Inactivo';
}

export interface Estudiante {
  id: number;
  codigo: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  estado: string;
  idPrograma: number;
  dni: string;
  direccion: string;
  fechaNacimiento: string;
  genero: 'M' | 'F' | 'O';
  programa?: Programa;
}

export interface ProgramacionHorario {
  id?: number;
  dia: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
  hora_inicio: string;
  hora_fin: string;
  turno: string;
  idGrupo: number;
  idAsignatura: number;
  idDocente: number;
  idAula: number;
  grupo?: Grupo;
  asignatura?: Asignatura;
  docente?: Docente;
  aula?: Aula;
}

export interface Matricula {
  id?: number;
  idEstudiante: number;
  idGrupo: number;
  fechaMatricula?: string;
  estado: 'Activo' | 'Retirado' | 'Aprobado' | 'Reprobado' | 'Incompleto';
  calificacionFinal?: number;
  asistenciaPorcentaje?: number;
  // Relaciones
  estudiante?: Estudiante;
  grupo?: Grupo;
}

export interface Aula {
  id?: number;
  codigo: string;
  nombre: string;
  capacidad: number;
  tipo: 'Teórica' | 'Laboratorio' | 'Idioma' | 'Multifuncional';
  descripcion?: string;
  idUnidad: number;
  estado: 'Disponible' | 'En Mantenimiento' | 'Ocupado' | 'Inactivo';
  tieneEquipamiento: boolean;
}

export interface Docente {
  id?: number;
  nombre: string;
  dni: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: string;
  genero: 'M' | 'F' | 'O';
  estado: 'Activo' | 'Inactivo' | 'Jubilado' | 'Licencia';
  tituloAcademico?: string;
  especialidad: string;
  tipoContrato: string;
  horasDisponibles: number;
  fechaIngreso?: string;
  fechaSalida?: string | null;
  idUnidadAcademica?: number;
  unidadAcademica?: UnidadAcademica;
}

export interface Asignatura {
  id?: number;
  codigo: string;
  nombre: string;
  creditos: number;
  horasTeoricas: number;
  horasPracticas: number;
  tipo: string;
  estado: string;
  idPrograma: number;
  idDocente: number;
  idUnidadAcademica?: number;
  // Campos opcionales que podrían venir de relaciones
  programa?: {
    id: number;
    nombre: string;
  };
  docente?: {
    id: number;
    nombre?: string;
    nombres?: string;
    apellido?: string;
    apellidos?: string;
    email?: string;
  };
  unidadAcademica?: {
    id: number;
    nombre: string;
  };
}

// Configuración de los turnos horarios
export const TIME_SLOTS = {
  M1: { start: '06:45', end: '07:30' },
  M2: { start: '07:30', end: '08:15' },
  M3: { start: '08:15', end: '09:00' },
  M4: { start: '09:00', end: '09:45' },
  T1: { start: '09:50', end: '10:35' },
  T2: { start: '10:35', end: '11:20' },
  T3: { start: '11:20', end: '12:05' },
  T4: { start: '12:05', end: '12:50' },
  A1: { start: '12:55', end: '13:40' },
  A2: { start: '13:40', end: '14:25' },
  A3: { start: '14:25', end: '15:10' },
  A4: { start: '15:10', end: '15:55' },
  N1: { start: '16:00', end: '16:45' },
  N2: { start: '16:45', end: '17:30' },
  N3: { start: '17:30', end: '18:15' },
  N4: { start: '18:15', end: '19:00' },
  E1: { start: '19:05', end: '19:50' },
  E2: { start: '19:50', end: '20:35' },
  E3: { start: '20:35', end: '21:20' },
  E4: { start: '21:20', end: '22:05' },
};

// Configuración de días de la semana
export const WEEK_DAYS = [
  'LUNES',
  'MARTES',
  'MIÉRCOLES',
  'JUEVES',
  'VIERNES',
  'SÁBADO',
];

// Configuración de los turnos
export const SHIFTS = {
  MORNING: 'MAÑANA',
  AFTERNOON: 'TARDE',
  NIGHT: 'NOCHE',
};

// Configuración de los estados de disponibilidad
export const AVAILABILITY_STATUS = {
  AVAILABLE: 'DISPONIBLE',
  OCCUPIED: 'OCUPADO',
  UNAVAILABLE: 'NO_DISPONIBLE',
};

export default API_ENDPOINTS;
