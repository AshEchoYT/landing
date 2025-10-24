import axios from 'axios';

const API_BASE = '/api';

export const organizerApi = {
  getOrganizerEvents: async (organizerId: string) => {
    const response = await axios.get(`${API_BASE}/organizers/${organizerId}/events`);
    return response.data;
  },
  createEvent: async (eventData: any) => {
    const response = await axios.post(`${API_BASE}/events`, eventData);
    return response.data;
  },
  updateEvent: async (id: string, eventData: any) => {
    const response = await axios.put(`${API_BASE}/events/${id}`, eventData);
    return response.data;
  },
  deleteEvent: async (id: string) => {
    const response = await axios.delete(`${API_BASE}/events/${id}`);
    return response.data;
  },
};