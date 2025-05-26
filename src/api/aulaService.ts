import { API_ENDPOINTS } from './config';
import type { Aula } from './config';
import { api } from './apiClient';

export const aulaService = {
  // Obtener todas las aulas
  async getAll(): Promise<Aula[]> {
    try {
      const response = await api.get(API_ENDPOINTS.AULAS.BASE);
      
      // Manejar respuesta paginada { data: Aula[], meta: {...} }
      if (response && typeof response === 'object' && 'data' in response) {
        return Array.isArray(response.data) ? response.data : [];
      }
      
      // Manejar caso donde la respuesta es directamente un array
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error al obtener las aulas:', error);
      return [];
    }
  },

  // Obtener un aula por ID
  async getById(id: number): Promise<Aula> {
    try {
      const url = API_ENDPOINTS.AULAS.BY_ID(id);
      console.log('Fetching aula from URL:', url);
      
      const response = await api.get<Aula>(url);
      console.log('Aula response:', response);
      
      if (!response) {
        throw new Error('No se recibió respuesta del servidor');
      }
      
      // Ensure the response has all required fields
      if (!response.id || !response.codigo || !response.nombre) {
        console.warn('Incomplete aula data from server:', response);
        throw new Error('Datos del aula incompletos recibidos del servidor');
      }
      
      return response;
    } catch (error: any) {
      console.error(`Error al obtener el aula con ID ${id}:`, error);
      
      if (error.message.includes('404')) {
        throw new Error(`No se encontró un aula con el ID ${id}. Verifique el ID e intente nuevamente.`);
      }
      
      throw new Error(error.message || 'No se pudo cargar el aula. Por favor, verifique el ID e intente nuevamente.');
    }
  },

  // Obtener aula por código
  async getByCodigo(codigo: string): Promise<Aula> {
    try {
      const response = await api.get(API_ENDPOINTS.AULAS.BY_CODIGO(codigo));
      return response as Aula;
    } catch (error) {
      console.error(`Error al obtener el aula con código ${codigo}:`, error);
      throw new Error('No se pudo cargar el aula. Por favor, verifique el código e intente nuevamente.');
    }
  },

  // Obtener aulas disponibles
  async getDisponibles(): Promise<Aula[]> {
    try {
      const response = await api.get(API_ENDPOINTS.AULAS.DISPONIBLES);
      return response as Aula[];
    } catch (error) {
      console.error('Error al obtener las aulas disponibles:', error);
      throw new Error('No se pudieron cargar las aulas disponibles. Por favor, intente nuevamente.');
    }
  },

  // Obtener disponibilidad de un aula
  async getDisponibilidad(id: number): Promise<any> {
    try {
      return await api.get(API_ENDPOINTS.AULAS.DISPONIBILIDAD(id));
    } catch (error) {
      console.error(`Error al obtener la disponibilidad del aula ${id}:`, error);
      throw new Error('No se pudo cargar la disponibilidad del aula. Por favor, intente nuevamente.');
    }
  },

  // Crear un nuevo aula
  async create(aula: Omit<Aula, 'id'>): Promise<Aula> {
    try {
      const response = await api.post(API_ENDPOINTS.AULAS.BASE, aula);
      return response as Aula;
    } catch (error: any) {
      console.error('Error al crear el aula:', error);
      throw new Error(error.message || 'No se pudo crear el aula. Verifique los datos e intente nuevamente.');
    }
  },

  // Función para limpiar el objeto aula antes de enviarlo al servidor
  cleanAulaData(aula: Partial<Aula>): Omit<Partial<Aula>, 'id'> {
    // Hacemos una copia del objeto para no modificar el original
    const cleaned = { ...aula };
    
    // Eliminamos el campo id que no debería ir en la petición de creación
    delete cleaned.id;
    
    // Eliminamos cualquier propiedad que sea undefined o null
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key as keyof Aula] === undefined || cleaned[key as keyof Aula] === null) {
        delete cleaned[key as keyof Aula];
      }
    });
    
    return cleaned;
  },

  // Actualizar un aula existente
  async update(id: number, aula: Partial<Aula>): Promise<Aula> {
    try {
      console.log('Attempting to update aula with ID:', id);
      
      // Limpiamos los datos antes de enviarlos
      const cleanedAula = this.cleanAulaData(aula);
      console.log('Cleaned aula data:', cleanedAula);
      
      // Primero intentamos obtener el aula para verificar que existe
      try {
        const existingAula = await this.getById(id);
        console.log('Aula exists, proceeding with update:', existingAula);
        
        // Intentar actualizar el aula con PATCH (más seguro que PUT para actualizaciones parciales)
        try {
          const url = API_ENDPOINTS.AULAS.BY_ID(id);
          console.log('Sending PATCH request to:', url);
          
          // Usamos PATCH en lugar de PUT para actualización parcial
          const response = await api.patch<Aula>(url, cleanedAula);
          console.log('Update response:', response);
          
          if (!response) {
            console.warn('Empty response from server, using local data');
            return { ...existingAula, ...cleanedAula, id } as Aula;
          }
          
          return response;
        } catch (updateError) {
          console.warn('Update via PATCH failed, trying POST to create new one...', updateError);
          // Si falla PATCH, intentar crear una nueva
          try {
            const newAula = await this.create(cleanedAula as Omit<Aula, 'id'>);
            console.log('Created new aula instead of updating:', newAula);
            return newAula;
          } catch (createError) {
            console.error('Failed to create new aula:', createError);
            throw new Error('No se pudo actualizar ni crear el aula. Por favor, intente nuevamente.');
          }
        }
      } catch (notFoundError) {
        console.warn(`Aula with ID ${id} not found, creating new one`);
        // Si el aula no existe, crear una nueva
        return this.create(cleanedAula as Omit<Aula, 'id'>);
      }
    } catch (error: any) {
      console.error(`Error al actualizar el aula con ID ${id}:`, error);
      
      // Mensajes de error más específicos
      if (error.message.includes('404')) {
        throw new Error('No se encontró el aula especificada. El ID puede ser incorrecto.');
      } else if (error.message.includes('401') || error.message.includes('403')) {
        throw new Error('No tiene permisos para actualizar aulas. Por favor, inicie sesión nuevamente.');
      } else if (error.message.includes('500')) {
        throw new Error('Error en el servidor al intentar actualizar el aula. Por favor, intente más tarde.');
      }
      
      throw new Error(error.message || 'No se pudo actualizar el aula. Verifique los datos e intente nuevamente.');
    }
  },

  // Eliminar un aula
  async delete(id: number): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.AULAS.BY_ID(id));
    } catch (error: any) {
      console.error(`Error al eliminar el aula con ID ${id}:`, error);
      throw new Error(error.message || 'No se pudo eliminar el aula. Por favor, intente nuevamente.');
    }
  },

  // Función temporal para verificar si un aula existe
  async checkAulaExists(id: number): Promise<boolean> {
    try {
      console.log(`Verificando si el aula con ID ${id} existe...`);
      const aulas = await this.getAll();
      const aulaExists = aulas.some(aula => aula.id === id);
      console.log(`Aula con ID ${id} ${aulaExists ? 'existe' : 'no existe'}`);
      return aulaExists;
    } catch (error) {
      console.error('Error al verificar el aula:', error);
      return false;
    }
  },
};
