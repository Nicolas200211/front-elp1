import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import CalendarView from '../components/calendar/CalendarView';

// Definir el tipo para los eventos del calendario que vienen de la API
interface ApiCalendarEvent {
  id: number;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
  turno: string;
  idGrupo: number;
  grupo: Grupo;
  idAsignatura: number;
  asignatura: Asignatura;
  idDocente: number;
  docente: Docente;
  idAula: number;
  aula: Aula;
  createdAt: string;
  updatedAt: string;
}

// Tipo para los eventos del calendario que espera FullCalendar
type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  extendedProps: {
    docente: string;
    aula: string;
    grupo: string;
    asignatura: string;
    dia: string;
    hora_inicio: string;
    hora_fin: string;
    turno: string;
    description: string;
  };
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  startRecur: string;
  endRecur: string;
  color: string;
  [key: string]: any; // Para permitir otras propiedades que pueda esperar FullCalendar
};

interface Grupo {
  id: number;
  idCiclo: number;
  nombre: string;
}

interface Asignatura {
  id: number;
  codigo: string;
  nombre: string;
  creditos: number;
  horasTeoricas: number;
  horasPracticas: number;
  tipo: string;
  estado: string;
  idProgramacion: number;
  idDocente: number;
  idUnidadAcademica: number;
  createdAt: string;
  updatedAt: string;
}

interface Docente {
  id: number;
  dni: string;
  email: string;
  telefono: string;
  direccion: string;
  tipoContrato: string;
  estado: string;
  nombres: string;
  apellidos: string;
  especialidad: string;
  horasDisponibles: number;
}

interface Aula {
  id: number;
  codigo: string;
  nombre: string;
  capacidad: number;
  tipo: string;
  descripcion: string;
  idUnidad: number;
  estado: string;
  tieneEquipamiento: boolean;
}

// Esta interfaz ya no es necesaria ya que estamos usando ApiCalendarEvent

// Función para mapear los días de la semana a números
const mapDayToNumber = (dia: string): number => {
  const dias: { [key: string]: number } = {
    'Lunes': 1,
    'Martes': 2,
    'Miércoles': 3,
    'Jueves': 4,
    'Viernes': 5,
    'Sábado': 6,
    'Domingo': 0
  };
  return dias[dia] || 0;
};

const DashboardPage: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/programacion-horarios');
        if (!response.ok) {
          throw new Error('Error al cargar los horarios');
        }
        const data = await response.json();
        
        // Mapear los datos de la API al formato que espera FullCalendar
        const formattedEvents = data.map((event: ApiCalendarEvent) => ({
          id: event.id.toString(),
          title: `${event.asignatura.nombre} - ${event.grupo.nombre}`,
          start: event.hora_inicio,
          end: event.hora_fin,
          allDay: false,
          extendedProps: {
            docente: `${event.docente.nombres} ${event.docente.apellidos}`,
            aula: event.aula.nombre,
            grupo: event.grupo.nombre,
            asignatura: event.asignatura.nombre,
            dia: event.dia,
            hora_inicio: event.hora_inicio,
            hora_fin: event.hora_fin,
            turno: event.turno,
            description: `Aula: ${event.aula.nombre}\n` +
                       `Docente: ${event.docente.nombres} ${event.docente.apellidos}\n` +
                       `Horario: ${event.hora_inicio} - ${event.hora_fin}`
          },
          daysOfWeek: [mapDayToNumber(event.dia)],
          startTime: event.hora_inicio,
          endTime: event.hora_fin,
          startRecur: new Date().toISOString().split('T')[0],
          endRecur: new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString().split('T')[0],
          color: event.turno === 'Mañana' ? '#3b82f6' : 
                event.turno === 'Tarde' ? '#10b981' : 
                '#8b5cf6' // Noche
        }));
        
        setEvents(formattedEvents);
      } catch (err) {
        console.error('Error al cargar los horarios:', err);
        setError('Error al cargar los horarios. Por favor, intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Función para manejar la creación de un nuevo evento
  const handleDateClick = (date: Date) => {
    console.log('Fecha clickeada:', date);
    // Aquí podrías abrir un formulario para crear un nuevo evento
  };

  // Función para manejar el clic en un evento
  const handleEventClick = (eventInfo: any) => {
    console.log('Evento clickeado:', eventInfo.event);
    // Aquí podrías abrir un modal con los detalles del evento
    const event = eventInfo.event;
    const extendedProps = event.extendedProps;
    
    alert(
      `Asignatura: ${extendedProps.asignatura}\n` +
      `Grupo: ${extendedProps.grupo}\n` +
      `Docente: ${extendedProps.docente}\n` +
      `Aula: ${extendedProps.aula}\n` +
      `Horario: ${extendedProps.hora_inicio} - ${extendedProps.hora_fin}\n` +
      `Día: ${extendedProps.dia}`
    );
  };

  // Función para manejar el arrastre de un evento
  const handleEventDrop = (eventInfo: any) => {
    console.log('Evento movido:', eventInfo.event);
    // Aquí podrías actualizar el evento en tu base de datos
  };

  // Función para manejar el redimensionamiento de un evento
  const handleEventResize = (eventInfo: any) => {
    console.log('Evento redimensionado:', eventInfo.event);
    // Aquí podrías actualizar el evento en tu base de datos
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Calendario Académico</h1>
              <p className="mt-1 text-sm text-gray-600">Visualización de horarios y programación de clases</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => handleDateClick(new Date())}
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Nuevo evento
              </button>
            </div>
          </div>
          
          {/* Filtros y controles */}
          <div className="mt-4 flex flex-wrap items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-sm text-gray-600">Turno Mañana</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm text-gray-600">Turno Tarde</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
                <span className="text-sm text-gray-600">Turno Noche</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <CalendarView 
            events={events}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
          />
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
