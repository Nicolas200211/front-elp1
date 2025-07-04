import { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';

interface Event {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  allDay?: boolean;
  color?: string;
  extendedProps?: {
    description?: string;
    location?: string;
    organizer?: string;
  };
}

interface CalendarViewProps {
  events?: Event[];
  onEventClick?: (event: Event) => void;
  onDateClick?: (date: Date) => void;
  onEventDrop?: (event: Event) => void;
  onEventResize?: (event: Event) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  events = [],
  onEventClick,
  onDateClick,
  onEventDrop,
  onEventResize,
}) => {
  const calendarRef = useRef<FullCalendar>(null);

  const handleEventClick = (clickInfo: any) => {
    if (onEventClick) {
      onEventClick({
        id: clickInfo.event.id,
        title: clickInfo.event.title,
        start: clickInfo.event.start,
        end: clickInfo.event.end,
        allDay: clickInfo.event.allDay,
        extendedProps: clickInfo.event.extendedProps,
      });
    }
  };

  const handleDateClick = (clickInfo: any) => {
    if (onDateClick) {
      onDateClick(clickInfo.date);
    }
  };

  const handleEventDrop = (dropInfo: any) => {
    if (onEventDrop) {
      onEventDrop({
        id: dropInfo.event.id,
        title: dropInfo.event.title,
        start: dropInfo.event.start,
        end: dropInfo.event.end,
        allDay: dropInfo.event.allDay,
        extendedProps: dropInfo.event.extendedProps,
      });
    }
  };

  const handleEventResize = (resizeInfo: any) => {
    if (onEventResize) {
      onEventResize({
        id: resizeInfo.event.id,
        title: resizeInfo.event.title,
        start: resizeInfo.event.start,
        end: resizeInfo.event.end,
        allDay: resizeInfo.event.allDay,
        extendedProps: resizeInfo.event.extendedProps,
      });
    }
  };

  // Usar los eventos proporcionados o un array vacío si no hay eventos
  const eventsToShow = events || [];

  // Estilos personalizados para la línea de tiempo actual y resaltado del día actual
  const customStyles = `
    /* Estilos para la línea de tiempo actual en vista semanal/diaria */
    .fc .fc-timegrid-now-indicator-container {
      z-index: 10 !important;
    }
    .fc .fc-timegrid-now-indicator-arrow {
      z-index: 11 !important;
      border-top-color: #ef4444 !important;
    }
    .fc .fc-timegrid-now-indicator-line {
      z-index: 11 !important;
      border-color: #ef4444 !important;
      border-width: 1px !important;
    }
    .fc .fc-timegrid-now-indicator.fc-timegrid-now-indicator-arrow {
      border-top-color: #ef4444 !important;
    }
    
    /* Estilo para el día actual en la vista de mes */
    .fc .fc-daygrid-day.fc-day-today {
      background-color: rgba(239, 68, 68, 0.1) !important;
    }
    .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
      color: #ef4444;
      font-weight: bold;
    }
  `;

  return (
    <div className="h-[calc(100vh-15rem)] w-full relative overflow-visible">
      <style>{customStyles}</style>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        }}
        locale={esLocale}
        buttonText={{
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
          day: 'Día',
          list: 'Lista'
        }}
        allDayText="Todo el día"
        noEventsText="No hay eventos para mostrar"
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        scrollTime="08:00:00"
        allDaySlot={false}
        firstDay={1} // Lunes como primer día de la semana
        weekNumberCalculation='ISO'
        dayMaxEvents={true}
        weekends={true}
        dayHeaderFormat={{ 
          weekday: 'long', 
          day: 'numeric',
          month: 'long',
          omitCommas: true
        }}
        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: 'short',
          hour12: true
        }}
        events={eventsToShow}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        height="auto"
        // Configuración específica para la vista de lista
        listDayFormat={false}
        listDaySideFormat={false}
        // Mostrar la duración del evento
        displayEventTime={true}
        displayEventEnd={true}
        // Configuración de la barra lateral
        navLinks={true}
        navLinkDayClick={(date) => {
          if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.changeView('timeGridDay', date);
          }
        }}
        // Configuración de la vista de lista
        views={{
          listWeek: {
            type: 'listWeek',
            duration: { weeks: 4 }, // Mostrar 4 semanas de eventos
            listDayFormat: { weekday: 'long', month: 'long', day: 'numeric' },
            noEventsText: 'No hay eventos programados',
            eventTimeFormat: {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }
          },
          dayGridMonth: {
            dayHeaderFormat: { weekday: 'long' },
            titleFormat: { year: 'numeric', month: 'long' },
            dayMaxEventRows: 4,
          },
          timeGridWeek: {
            dayHeaderFormat: { weekday: 'long', day: 'numeric' },
            titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
            slotLabelFormat: {
              hour: '2-digit',
              minute: '2-digit',
              meridiem: 'short',
              hour12: true
            },
            allDayText: 'Todo el día',
            scrollTime: '08:00:00',
          },
          timeGridDay: {
            dayHeaderFormat: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
            slotLabelFormat: {
              hour: '2-digit',
              minute: '2-digit',
              meridiem: 'short',
              hour12: true
            },
            allDayText: 'Todo el día',
            scrollTime: '08:00:00',
          }
        }}
        // Mostrar los eventos pasados con opacidad reducida
        eventDidMount={(arg) => {
          const now = new Date();
          const eventEnd = arg.event.end ? new Date(arg.event.end) : new Date(arg.event.start || '');
          
          if (eventEnd < now) {
            arg.el.style.opacity = '0.6';
          }
        }}
        eventContent={(arg) => {
          const event = arg.event;
          const extendedProps = event.extendedProps || {};
          const isPast = arg.isPast && !arg.isToday;
          const isDetailedView = arg.view.type.includes('timeGridDay') || arg.view.type.includes('listWeek');
          
          if (isDetailedView) {
            // Vista detallada (día o lista)
            return (
              <div className="p-1.5 overflow-hidden h-full">
                <div className={`${isPast ? 'opacity-80' : ''} h-full flex flex-col justify-between`}>
                  {/* Primera línea: Hora y título principal */}
                  <div className="flex items-start">
                    {arg.timeText && (
                      <span className="font-bold text-sm text-blue-700 whitespace-nowrap mr-2">
                        {arg.timeText}
                      </span>
                    )}
                    <span className="font-bold text-sm text-gray-900 truncate">
                      {extendedProps.asignatura || event.title}
                    </span>
                  </div>
                  
                  {/* Segunda línea: Aula y grupo */}
                  {(extendedProps.aula || extendedProps.grupo) && (
                    <div className="flex items-center mt-1">
                      {extendedProps.aula && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-bold mr-2 shadow-sm">
                          🏫 {extendedProps.aula}
                        </span>
                      )}
                      {extendedProps.grupo && (
                        <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                          👥 {extendedProps.grupo}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Tercera línea: Docente */}
                  {extendedProps.docente && (
                    <div className="text-xs font-medium text-gray-700 mt-1 flex items-center">
                      <span className="mr-1">👨‍🏫</span>
                      <span className="truncate">{extendedProps.docente}</span>
                    </div>
                  )}
                  
                  {/* Turno (solo en vista de lista) */}
                  {arg.view.type.includes('listWeek') && extendedProps.turno && (
                    <div className="mt-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        extendedProps.turno === 'Mañana' ? 'bg-blue-100 text-blue-800' :
                        extendedProps.turno === 'Tarde' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {extendedProps.turno}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          }
          
          // Vista compacta (mes o semana)
          return (
            <div className="p-0.5 overflow-hidden">
              <div className={`${isPast ? 'opacity-70' : ''} text-xs`}>
                <div className="flex items-center">
                  {arg.timeText && (
                    <span className="font-medium text-blue-600 mr-1">
                      {arg.timeText}
                    </span>
                  )}
                  <span className="font-semibold truncate">
                    {extendedProps.asignatura || event.title}
                  </span>
                </div>
                {extendedProps.aula && (
                  <div className="text-[10px] text-gray-600 truncate">
                    {extendedProps.aula}
                  </div>
                )}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};

export default CalendarView;
