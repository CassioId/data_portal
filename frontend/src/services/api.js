   import axios from 'axios';

   const api = axios.create({
     baseURL: '/api'
   });

   export const getEstados = async () => {
     try {
       const response = await api.get('/localidades/estados');
       return response.data;
     } catch (error) {
       console.error('Erro ao buscar estados:', error);
       throw error;
     }
   };

   export const getMunicipiosPorEstado = async (ufId) => {
     try {
       const response = await api.get(`/localidades/estados/${ufId}/municipios`);
       return response.data;
     } catch (error) {
       console.error('Erro ao buscar municípios:', error);
       throw error;
     }
   };

   export const getAgregados = async (codigo, filtros) => {
     try {
       const response = await api.get(`/agregados/${codigo}`, { params: { filtros } });
       return response.data;
     } catch (error) {
       console.error('Erro ao buscar agregados:', error);
       throw error;
     }
   };

   export const downloadRelatorio = (tipo, parametros, formato = 'csv') => {
     const queryParams = new URLSearchParams({ ...parametros, formato });
     const url = `/api/relatorios/${tipo}?${queryParams.toString()}`;
     window.open(url, '_blank');
   };

   export default api;
