import { api, setAccessToken } from './api.js';
import type { User, Vehicle, VehicleFilters } from './types.js';

interface AuthResponse {
  user: User;
  accessToken: string;
}

export const authApi = {
  async register(data: { name: string; email: string; password: string }): Promise<User> {
    const res = await api.post<{ user: User }>('/auth/register', data);
    return res.data.user;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', data);
    setAccessToken(res.data.accessToken);
    return res.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    setAccessToken(null);
  },

  async me(): Promise<User> {
    const res = await api.get<{ user: User }>('/auth/me');
    return res.data.user;
  },
};

/** Payload for creating/updating a vehicle (price already converted to cents). */
export interface VehiclePayload {
  make: string;
  model: string;
  category: string;
  priceCents: number;
  quantity: number;
}

export const vehicleApi = {
  async list(): Promise<Vehicle[]> {
    const res = await api.get<{ vehicles: Vehicle[] }>('/vehicles');
    return res.data.vehicles;
  },

  async search(filters: VehicleFilters): Promise<Vehicle[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, String(value));
      }
    });
    const res = await api.get<{ vehicles: Vehicle[] }>(`/vehicles/search?${params.toString()}`);
    return res.data.vehicles;
  },

  async create(data: VehiclePayload): Promise<Vehicle> {
    const res = await api.post<{ vehicle: Vehicle }>('/vehicles', data);
    return res.data.vehicle;
  },

  async update(id: string, data: Partial<VehiclePayload>): Promise<Vehicle> {
    const res = await api.put<{ vehicle: Vehicle }>(`/vehicles/${id}`, data);
    return res.data.vehicle;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/vehicles/${id}`);
  },

  async purchase(id: string, quantity = 1): Promise<Vehicle> {
    const res = await api.post<{ vehicle: Vehicle }>(`/vehicles/${id}/purchase`, { quantity });
    return res.data.vehicle;
  },

  async restock(id: string, quantity: number): Promise<Vehicle> {
    const res = await api.post<{ vehicle: Vehicle }>(`/vehicles/${id}/restock`, { quantity });
    return res.data.vehicle;
  },
};
