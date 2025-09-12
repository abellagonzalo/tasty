import axios from 'axios';
import { Position, CreatePositionDTO } from '../types/Position';

const API_BASE_URL = 'http://localhost:3001/api';

export const api = {
  positions: {
    create: async (position: CreatePositionDTO): Promise<Position> => {
      const response = await axios.post(`${API_BASE_URL}/positions`, position);
      return response.data;
    },
    
    getAll: async (): Promise<Position[]> => {
      const response = await axios.get(`${API_BASE_URL}/positions`);
      return response.data;
    },
    
    getById: async (id: string): Promise<Position> => {
      const response = await axios.get(`${API_BASE_URL}/positions/${id}`);
      return response.data;
    },
    
    update: async (id: string, position: Partial<CreatePositionDTO>): Promise<Position> => {
      const response = await axios.put(`${API_BASE_URL}/positions/${id}`, position);
      return response.data;
    },
    
    delete: async (id: string): Promise<void> => {
      await axios.delete(`${API_BASE_URL}/positions/${id}`);
    }
  }
};