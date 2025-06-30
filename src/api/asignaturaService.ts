import { api } from './apiClient';
import { API_ENDPOINTS } from './config';
import type { Asignatura, Docente } from './config';
import { docenteService } from './docenteService';

export const asignaturaService = {
  /**
   * Obtener lista de todas las asignaturas
   * @returns Promise<Asignatura[]> Lista de asignaturas
   */
  async getAll(): Promise<Asignatura[]> {
    console.log('[asignaturaService] Obteniendo todas las asignaturas');
    try {
      // Obtener las asignaturas y los docentes en paralelo
      const [asignaturasResponse, docentesResponse] = await Promise.all([
        api.get(API_ENDPOINTS.ASIGNATURAS.BASE) as Promise<any>,
        docenteService.getAll() as Promise<any>
      ]);
      
      console.log('[asignaturaService] Respuesta de asignaturas:', asignaturasResponse);
      console.log('[asignaturaService] Respuesta de docentes:', docentesResponse);
      
      let asignaturas: Asignatura[] = [];
      let docentes: Docente[] = [];
      
      // Manejar la respuesta de docentes que puede venir en diferentes formatos
      if (Array.isArray(docentesResponse)) {
        docentes = docentesResponse as Docente[];
      } else if (docentesResponse && typeof docentesResponse === 'object') {
        const response = docentesResponse as any;
        if ('data' in response) {
          if (Array.isArray(response.data)) {
            docentes = response.data as Docente[];
          } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
            docentes = Array.isArray(response.data.data) ? (response.data.data as Docente[]) : [];
          }
        }
      }
      
      // Manejar la respuesta de asignaturas que puede venir en diferentes formatos
      if (Array.isArray(asignaturasResponse)) {
        console.log('[asignaturaService] La respuesta es un array de asignaturas');
        asignaturas = asignaturasResponse as Asignatura[];
      } else if (asignaturasResponse && typeof asignaturasResponse === 'object') {
        const response = asignaturasResponse as any;
        if ('data' in response) {
          if (Array.isArray(response.data)) {
            console.log('[asignaturaService] La respuesta contiene un array de asignaturas en la propiedad data');
            asignaturas = response.data as Asignatura[];
          } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
            // Caso donde la respuesta está en data.data (común en respuestas paginadas)
            asignaturas = Array.isArray(response.data.data) ? (response.data.data as Asignatura[]) : [];
          }
        }
      }
      
      console.log('[asignaturaService] Datos de asignaturas antes de mapear:', asignaturas);
      console.log('[asignaturaService] Datos de docentes disponibles:', docentes);
      
      // Crear un mapa de docentes por ID para búsqueda rápida
      const docentesMap = new Map<number, Docente>();
      docentes.forEach(docente => {
        if (docente.id) {
          docentesMap.set(docente.id, {
            ...docente,
            // Asegurarse de que los campos requeridos estén presentes
            nombre: docente.nombres || docente.nombre || '',
            nombres: docente.nombres || docente.nombre || '',
            apellidos: docente.apellidos || '',
            email: docente.email || '',
            estado: docente.estado || 'Activo',
            genero: docente.genero || 'O',
            especialidad: docente.especialidad || '',
            tipoContrato: docente.tipoContrato || 'Tiempo completo',
            horasDisponibles: docente.horasDisponibles || 0
          });
        }
      });
      
      // Mapear las asignaturas con los datos de los docentes
      const asignaturasConDocentes = asignaturas.map(asignatura => {
        const docenteCompleto = asignatura.idDocente ? docentesMap.get(asignatura.idDocente) : null;
        
        // Crear un objeto docente compatible con la interfaz esperada
        let docente: any = null;
        
        if (docenteCompleto) {
          docente = {
            id: docenteCompleto.id,
            nombre: docenteCompleto.nombres || docenteCompleto.nombre || 'Docente',
            nombres: docenteCompleto.nombres || docenteCompleto.nombre || 'Docente',
            apellidos: docenteCompleto.apellidos || `ID: ${asignatura.idDocente}`,
            email: docenteCompleto.email || ''
          };
        } else if (asignatura.idDocente) {
          // Si solo tenemos el ID del docente
          docente = {
            id: asignatura.idDocente,
            nombre: 'Docente',
            nombres: 'Docente',
            apellidos: `ID: ${asignatura.idDocente}`,
            email: ''
          };
        }
        
        return {
          ...asignatura,
          docente: docente || undefined
        } as Asignatura;
      });
      
      console.log('[asignaturaService] Asignaturas con docentes:', asignaturasConDocentes);
      return asignaturasConDocentes;
      
      console.warn('[asignaturaService] Formato de respuesta inesperado, devolviendo array vacío');
      return [];
    } catch (error) {
      console.error('[asignaturaService] Error al obtener las asignaturas:', error);
      throw new Error('No se pudieron cargar las asignaturas. Por favor, intente nuevamente.');
    }
  },

  /**
   * Obtener una asignatura por su ID
   * @param id ID de la asignatura
   * @returns Promise<Asignatura> Datos de la asignatura
   */
  async getById(id: string | number): Promise<Asignatura> {
    console.log(`[asignaturaService] Obteniendo asignatura con ID: ${id}`);
    try {
      const response = await api.get(API_ENDPOINTS.ASIGNATURAS.BY_ID(id));
      console.log(`[asignaturaService] Respuesta para ID ${id}:`, response);
      
      let asignatura: Asignatura | null = null;
      
      // Verificar si la respuesta es la asignatura directamente
      if (response && typeof response === 'object' && 'id' in response) {
        console.log('[asignaturaService] Se recibió la asignatura directamente');
        asignatura = response as Asignatura;
      }
      // O si está en la propiedad data
      else if (response && typeof response === 'object' && 'data' in response) {
        console.log('[asignaturaService] Se recibió la asignatura en la propiedad data');
        asignatura = response.data as Asignatura;
      }
      
      if (!asignatura) {
        throw new Error('No se encontró la asignatura solicitada');
      }
      
      // Asegurar que los datos del docente tengan la estructura correcta
      if (asignatura.docente) {
        asignatura.docente = {
          id: asignatura.docente.id,
          nombres: asignatura.docente.nombres || asignatura.docente.nombre || '',
          apellidos: asignatura.docente.apellidos || asignatura.docente.apellido || '',
          email: asignatura.docente.email || ''
        };
      }
      
      return asignatura;
      
      console.error('[asignaturaService] Formato de respuesta inesperado:', response);
      throw new Error('Formato de respuesta inesperado al cargar la asignatura');
    } catch (error) {
      console.error(`[asignaturaService] Error al obtener la asignatura con ID ${id}:`, error);
      throw new Error('No se pudo cargar la asignatura. Por favor, verifique el ID e intente nuevamente.');
    }
  },

  /**
   * Crear una nueva asignatura
   * @param asignatura Datos de la nueva asignatura
   * @returns Promise<Asignatura> Asignatura creada
   */
  async create(asignatura: Omit<Asignatura, 'id'>): Promise<Asignatura> {
    try {
      const response = await api.post(API_ENDPOINTS.ASIGNATURAS.BASE, asignatura) as unknown;
      
      // If we get a response with data, return it
      if (response && typeof response === 'object') {
        // Some APIs might return the created object directly, others might wrap it in a 'data' property
        if ('data' in response) {
          return (response as { data: Asignatura }).data;
        }
        // If the response is the actual data (common with 201 responses)
        return response as Asignatura;
      }
      
      // If no response data, return the original data with a generated ID (or throw an error if that's not appropriate)
      // This is a fallback and might need adjustment based on your API behavior
      return { ...asignatura, id: Date.now() } as Asignatura;
    } catch (error) {
      console.error('Error al crear la asignatura:', error);
      throw new Error('No se pudo crear la asignatura. Verifique los datos e intente nuevamente.');
    }
  },

  /**
   * Actualizar una asignatura existente
   * @param id ID de la asignatura a actualizar
   * @param asignatura Datos actualizados de la asignatura
   * @returns Promise<Asignatura> Asignatura actualizada
   */
  async update(id: string | number, asignatura: Partial<Asignatura>): Promise<Asignatura> {
    try {
      console.log('Enviando datos al servidor (asignaturaService):', asignatura);
      
      // Crear un objeto con solo los campos permitidos (excluyendo el ID)
      const camposPermitidos = [
        'codigo', 'nombre', 'creditos', 'horas_teoricas',
        'horas_practicas', 'tipo', 'estado', 'id_programa',
        'id_docente', 'id_unidad_academica'
      ];
      
      const datosActualizados: Record<string, any> = {};
      
      // Incluir siempre el campo 'tipo' si está presente, incluso si es una cadena vacía
      if ('tipo' in asignatura) {
        datosActualizados['tipo'] = asignatura.tipo || '';
      }
      
      // Filtrar solo los campos permitidos y que no sean undefined
      Object.entries(asignatura).forEach(([key, value]) => {
        if (key !== 'tipo' && camposPermitidos.includes(key) && value !== undefined) {
          datosActualizados[key] = value;
        }
      });
      
      console.log('Datos filtrados para actualización:', datosActualizados);
      
      const response = await api.patch(API_ENDPOINTS.ASIGNATURAS.BY_ID(id), datosActualizados);
      
      console.log('Respuesta del servidor:', response);
      
      // Si la respuesta es exitosa pero no tiene datos, devolvemos los datos que enviamos
      let asignaturaActualizada: Asignatura;
      
      if (response) {
        // Si la respuesta tiene una propiedad 'data', la usamos
        if (typeof response === 'object' && 'data' in response) {
          asignaturaActualizada = response.data as Asignatura;
        } else {
          // Si no, usamos la respuesta completa
          asignaturaActualizada = response as unknown as Asignatura;
        }
        
        // Asegurarnos de que el campo 'tipo' esté presente en la respuesta
        if (asignaturaActualizada && typeof asignaturaActualizada === 'object') {
          // Si el tipo no está en la respuesta pero sí en los datos enviados, lo mantenemos
          if (!asignaturaActualizada.tipo && datosActualizados.tipo !== undefined) {
            asignaturaActualizada.tipo = datosActualizados.tipo;
          }
          return asignaturaActualizada;
        }
      }
      
      // Si no hay respuesta válida, devolvemos los datos que enviamos con el ID
      // asegurándonos de incluir el tipo
      return { 
        ...datosActualizados, 
        id,
        tipo: datosActualizados.tipo || '' // Asegurar que tipo tenga un valor por defecto
      } as unknown as Asignatura;
    } catch (error) {
      console.error(`Error al actualizar la asignatura con ID ${id}:`, error);
      throw new Error('No se pudo actualizar la asignatura. Verifique los datos e intente nuevamente.');
    }
  },

  /**
   * Eliminar una asignatura
   * @param id ID de la asignatura a eliminar
   * @returns Promise<void>
   */
  async delete(id: string | number): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.ASIGNATURAS.BY_ID(id));
    } catch (error) {
      console.error(`Error al eliminar la asignatura con ID ${id}:`, error);
      throw new Error('No se pudo eliminar la asignatura. Por favor, intente nuevamente.');
    }
  },

  /**
   * Obtener asignaturas por programación general
   * @param programacionId ID de la programación general
   * @returns Promise<Asignatura[]> Lista de asignaturas de la programación
   */
  async getByProgramacion(programacionId: string | number): Promise<Asignatura[]> {
    try {
      const response = await api.get(`${API_ENDPOINTS.ASIGNATURAS.BASE}?idProgramacionGeneral=${programacionId}`);
      // Handle response with data and meta properties
      if (response && typeof response === 'object' && 'data' in response) {
        return Array.isArray(response.data) ? response.data : [];
      }
      return [];
    } catch (error) {
      console.error(`Error al obtener asignaturas de la programación ${programacionId}:`, error);
      throw new Error('No se pudieron cargar las asignaturas de la programación. Por favor, intente nuevamente.');
    }
  },

  /**
   * @deprecated Usar getByProgramacion en su lugar
   */
  async getByPrograma(programaId: string | number): Promise<Asignatura[]> {
    console.warn('El método getByPrograma está obsoleto. Use getByProgramacion en su lugar.');
    return this.getByProgramacion(programaId);
  },

  /**
   * Obtener asignaturas por docente
   * @param docenteId ID del docente
   * @returns Promise<Asignatura[]> Lista de asignaturas del docente
   */
  async getByDocente(docenteId: string | number): Promise<Asignatura[]> {
    try {
      const response = await api.get(API_ENDPOINTS.ASIGNATURAS.BY_DOCENTE(docenteId));
      // Handle response with data and meta properties
      if (response && typeof response === 'object' && 'data' in response) {
        return Array.isArray(response.data) ? response.data : [];
      }
      return [];
    } catch (error) {
      console.error(`Error al obtener las asignaturas del docente ${docenteId}:`, error);
      throw new Error('No se pudieron cargar las asignaturas del docente. Por favor, intente nuevamente.');
    }
  },
};
