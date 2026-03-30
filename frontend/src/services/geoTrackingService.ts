import { api } from './api';
import {
  Journey,
  GeoFence,
  GeoLocation,
  TravelAllowanceResult,
  GeoTrackingStats,
} from '../types/geoTracking';

export interface TravelLogResponse {
  id: string;
  employeeId: string;
  startLocation: GeoLocation;
  endLocation: GeoLocation;
  waypoints: GeoLocation[];
  totalDistance: number;
  totalDuration: number;
  startTime: Date;
  endTime: Date;
  purpose?: string;
  travelAllowance: number;
  status: 'In Progress' | 'Completed' | 'Cancelled' | 'Pending' | 'Approved' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface GeoFenceResponse {
  id: string;
  name: string;
  center: GeoLocation;
  radius: number;
  type: 'Office' | 'Site' | 'Restricted' | 'Custom';
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const geoTrackingService = {
  // Travel Log operations
  trackLocation: async (data: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number;
    address?: string;
  }): Promise<TravelLogResponse> => {
    const response = await api.post('/geo-tracking/track-location', data);
    return response.data;
  },

  getDailyJourney: async (
    employeeId: string,
    date: string
  ): Promise<TravelLogResponse[]> => {
    const response = await api.get(`/geo-tracking/daily-journey/${employeeId}`, {
      params: { date },
    });
    return response.data;
  },

  getJourneysByDateRange: async (
    employeeId: string,
    startDate: string,
    endDate: string
  ): Promise<TravelLogResponse[]> => {
    const response = await api.get(`/geo-tracking/journeys/${employeeId}`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  approveJourney: async (
    journeyId: string,
    approverId: string,
    notes?: string
  ): Promise<void> => {
    await api.put(`/geo-tracking/journeys/${journeyId}/approve`, {
      approverId,
      notes,
    });
  },

  rejectJourney: async (
    journeyId: string,
    approverId: string,
    reason: string
  ): Promise<void> => {
    await api.put(`/geo-tracking/journeys/${journeyId}/reject`, {
      approverId,
      reason,
    });
  },

  exportJourneyData: async (
    employeeId: string,
    startDate: string,
    endDate: string,
    format: 'csv' | 'pdf' = 'csv'
  ): Promise<Blob> => {
    const response = await api.get(`/geo-tracking/export/${employeeId}`, {
      params: { startDate, endDate, format },
      responseType: 'blob',
    });
    return response.data;
  },

  // Travel Allowance operations
  getMonthlyAllowance: async (
    employeeId: string,
    month: number,
    year: number
  ): Promise<{
    totalDistance: number;
    totalAllowance: number;
    journeyCount: number;
    rate: number;
    currency: string;
    journeys: TravelLogResponse[];
  }> => {
    const response = await api.get(`/geo-tracking/monthly-allowance/${employeeId}`, {
      params: { month, year },
    });
    return response.data;
  },

  getYearlyStats: async (
    employeeId: string,
    year: number
  ): Promise<GeoTrackingStats> => {
    const response = await api.get(`/geo-tracking/yearly-stats/${employeeId}`, {
      params: { year },
    });
    return response.data;
  },

  // Geo-fence operations
  createGeoFence: async (data: {
    name: string;
    center: { latitude: number; longitude: number };
    radius: number;
    type: 'Office' | 'Site' | 'Restricted' | 'Custom';
  }): Promise<GeoFenceResponse> => {
    const response = await api.post('/geo-tracking/geo-fences', data);
    return response.data;
  },

  getGeoFences: async (type?: string): Promise<GeoFenceResponse[]> => {
    const response = await api.get('/geo-tracking/geo-fences', {
      params: { type },
    });
    return response.data;
  },

  getGeoFence: async (id: string): Promise<GeoFenceResponse> => {
    const response = await api.get(`/geo-tracking/geo-fences/${id}`);
    return response.data;
  },

  updateGeoFence: async (
    id: string,
    data: Partial<{
      name: string;
      center: { latitude: number; longitude: number };
      radius: number;
      type: 'Office' | 'Site' | 'Restricted' | 'Custom';
      enabled: boolean;
    }>
  ): Promise<GeoFenceResponse> => {
    const response = await api.put(`/geo-tracking/geo-fences/${id}`, data);
    return response.data;
  },

  deleteGeoFence: async (id: string): Promise<void> => {
    await api.delete(`/geo-tracking/geo-fences/${id}`);
  },

  toggleGeoFence: async (id: string, enabled: boolean): Promise<GeoFenceResponse> => {
    const response = await api.put(`/geo-tracking/geo-fences/${id}/toggle`, {
      enabled,
    });
    return response.data;
  },

  getPendingApprovals: async (): Promise<TravelLogResponse[]> => {
    const response = await api.get('/geo-tracking/pending-approvals');
    return response.data;
  },

  getTeamJourneys: async (
    managerId: string,
    startDate: string,
    endDate: string
  ): Promise<TravelLogResponse[]> => {
    const response = await api.get(`/geo-tracking/team-journeys/${managerId}`, {
      params: { startDate, endDate },
    });
    return response.data;
  },
};
