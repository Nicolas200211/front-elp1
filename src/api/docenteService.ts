import { API_ENDPOINTS } from './config';
import type { Docente } from './config';
import { api } from './apiClient';

/**
 * Servicio para gestionar las operaciones de docentes
 */
export const docenteService = {
  /**
   * Obtener todos los docentes
   * @returns Promise<Docente[]> Lista de docentes
   */
  async getAll(): Promise<Docente[]> {
    try {
      const response = await api.get(API_ENDPOINTS.DOCENTES.BASE);
      // Handle response with data and meta properties
      if (response && typeof response === 'object' && 'data' in response) {
        return Array.isArray(response.data) ? response.data : [];
      }
      return [];
    } catch (error) {
      console.error('Error al obtener los docentes:', error);
      throw new Error('No se pudieron cargar los docentes. Por favor, intente nuevamente.');
    }
  },

  /**
   * Buscar docentes por término de búsqueda
   * @param query Término de búsqueda
   * @returns Promise<Docente[]> Lista de docentes que coinciden con la búsqueda
   */
  async search(query: string): Promise<Docente[]> {
    try {
      const response = await api.get(API_ENDPOINTS.DOCENTES.SEARCH(query));
      // Handle response with data and meta properties
      if (response && typeof response === 'object' && 'data' in response) {
        return Array.isArray(response.data) ? response.data : [];
      }
      return [];
    } catch (error) {
      console.error('Error al buscar docentes:', error);
      throw new Error('No se pudo realizar la búsqueda. Por favor, intente nuevamente.');
    }
  },

  /**
   * Obtener un docente por su ID
   * @param id ID del docente
   * @returns Promise<Docente> Datos del docente
   */
  async getById(id: string | number): Promise<Docente> {
    try {
      const response = await api.get(API_ENDPOINTS.DOCENTES.BY_ID(id));
      // Handle response with data property
      if (response && typeof response === 'object' && 'data' in response) {
        return response.data as Docente;
      }
      throw new Error('No se encontraron datos del docente');
    } catch (error) {
      console.error(`Error al obtener el docente con ID ${id}:`, error);
      throw new Error('No se pudo cargar el docente. Por favor, verifique el ID e intente nuevamente.');
    }
  },

  /**
   * Crear un nuevo docente
   * @param docente Datos del nuevo docente
   * @returns Promise<Docente> Docente creado
   */
  async create(docente: Omit<Docente, 'id'>): Promise<Docente> {
    try {
      // Crear un objeto limpio solo con los campos necesarios
      const docenteToCreate = {
        dni: docente.dni,
        nombres: docente.nombres,
        apellidos: docente.apellidos,
        email: docente.email,
        especialidad: docente.especialidad,
        telefono: docente.telefono,
        direccion: docente.direccion,
        estado: docente.estado === 'Activo' ? 'Activo' : 'Inactivo',
        tipoContrato: docente.tipoContrato || 'Tiempo completo',
        horasDisponibles: docente.horasDisponibles || 0,
        ...(docente.fechaNacimiento && { fechaNacimiento: docente.fechaNacimiento }),
        ...(docente.tituloAcademico && { tituloAcademico: docente.tituloAcademico }),
        ...(docente.fechaIngreso && { fechaIngreso: docente.fechaIngreso }),
        ...(docente.fechaSalida && { fechaSalida: docente.fechaSalida }),
        ...(docente.idUnidadAcademica && { idUnidadAcademica: docente.idUnidadAcademica })
      };

      console.log('Enviando datos del docente:', docenteToCreate);
      const response = await api.post(API_ENDPOINTS.DOCENTES.BASE, docenteToCreate);
      
      console.log('Respuesta del servidor:', response);
      
      // La respuesta puede ser directamente el objeto Docente o estar en una propiedad 'data'
      const createdDocente = response.data || response;
      
      if (!createdDocente) {
        throw new Error('No se recibieron datos del docente creado');
      }
      
      return createdDocente as Docente;
    } catch (error) {
      console.error('Error al crear el docente:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`No se pudo crear el docente: ${errorMessage}`);
    }
  },

  /**
   * Actualizar un docente existente
   * @param id ID del docente a actualizar
   * @param docente Datos actualizados del docente
   * @returns Promise<Docente> Docente actualizado
   */
  async update(id: string | number, docente: Partial<Docente>): Promise<Docente> {
    try {
      const response = await api.patch(API_ENDPOINTS.DOCENTES.BY_ID(id), docente);
      // Handle response with data property
      if (response && typeof response === 'object' && 'data' in response) {
        return response.data as Docente;
      }
      throw new Error('No se recibieron datos del docente actualizado');
    } catch (error) {
      console.error(`Error al actualizar el docente con ID ${id}:`, error);
      throw new Error('No se pudo actualizar el docente. Verifique los datos e intente nuevamente.');
    }
  },

  /**
   * Eliminar un docente
   * @param id ID del docente a eliminar
   * @returns Promise<void>
   */
  async delete(id: string | number): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.DOCENTES.BY_ID(id));
    } catch (error) {
      console.error(`Error al eliminar el docente con ID ${id}:`, error);
      throw new Error('No se pudo eliminar el docente. Por favor, intente nuevamente.');
    }
  },

  /**
   * Verificar si un docente está sobreasignado
   * @param id ID del docente
   * @returns Promise<{ sobreasignado: boolean, mensaje: string }> Estado de sobreasignación
   */
  async verificarSobreasignacion(id: string | number): Promise<{ sobreasignado: boolean, mensaje: string }> {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.DOCENTES.BY_ID(id)}/sobreasignacion`
      );
      // Handle response with data property
      if (response && typeof response === 'object' && 'data' in response) {
        return response.data as { sobreasignado: boolean, mensaje: string };
      }
      throw new Error('No se pudo verificar la sobreasignación');
    } catch (error) {
      console.error(`Error al verificar la sobreasignación del docente con ID ${id}:`, error);
      throw new Error('No se pudo verificar la sobreasignación del docente. Por favor, intente nuevamente.');
    }
  },
};
