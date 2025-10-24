import axios from 'axios';

const API_BASE = '/api';

// Mock data for events
const mockEvents = [
  {
    id: '1',
    title: 'Neon Nights Festival',
    description: 'An electrifying music festival featuring top DJs and neon-lit performances under the stars.',
    date: '2025-11-15T20:00:00Z',
    venue: 'Chennai Trade Centre',
    organizer: 'Events.Echo India',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
    tags: ['music', 'festival', 'electronic', 'concert'],
    price: 7500,
    capacity: 5000,
    availableSeats: 2450,
  },
  {
    id: '2',
    title: 'Cyber Punk Theater Show',
    description: 'Immerse yourself in a futuristic theater experience with holographic projections and cyber punk aesthetics.',
    date: '2025-12-01T19:30:00Z',
    venue: 'Narada Gana Sabha',
    organizer: 'Future Arts Chennai',
    image: 'https://images.unsplash.com/photo-1489599735734-79b4d4c4b5c?w=800&h=400&fit=crop',
    tags: ['theater', 'cyberpunk', 'immersive', 'performance'],
    price: 5500,
    capacity: 800,
    availableSeats: 320,
  },
  {
    id: '3',
    title: 'Synthwave Concert',
    description: 'Retro-futuristic synthwave music with stunning visual effects and laser shows.',
    date: '2025-10-30T21:00:00Z',
    venue: 'Phoenix Market City',
    organizer: 'RetroWave Productions India',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=400&fit=crop',
    tags: ['concert', 'synthwave', 'retro', 'music'],
    price: 3800,
    capacity: 1200,
    availableSeats: 890,
  },
  {
    id: '4',
    title: 'Zakir Hussain Live',
    description: 'Legendary tabla maestro Zakir Hussain brings his mesmerizing rhythms and fusion music to Chennai in this exclusive performance.',
    date: '2025-11-08T20:00:00Z',
    venue: 'Music Academy Chennai',
    organizer: 'Indian Classical Music Society',
    image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=800&h=400&fit=crop',
    tags: ['classical', 'indian', 'performance', 'music'],
    price: 7200,
    capacity: 1500,
    availableSeats: 720,
  },
  {
    id: '5',
    title: 'Bharatanatyam Dance Festival',
    description: 'Witness mesmerizing traditional Bharatanatyam dance performances by renowned artists with modern holographic enhancements.',
    date: '2025-11-05T20:00:00Z',
    venue: 'Kalakshetra Foundation',
    organizer: 'Dance Dimensions India',
    image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=800&h=400&fit=crop',
    tags: ['dance', 'traditional', 'performance', 'indian'],
    price: 4600,
    capacity: 600,
    availableSeats: 280,
  },
  {
    id: '6',
    title: 'AR Rahman Live Concert',
    description: 'Oscar-winning composer AR Rahman brings his magical music with a full orchestra and spectacular light show.',
    date: '2025-12-20T19:00:00Z',
    venue: 'Jawaharlal Nehru Stadium',
    organizer: 'KM Music Conservatory',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
    tags: ['bollywood', 'concert', 'music', 'indian'],
    price: 10000,
    capacity: 8000,
    availableSeats: 4200,
  },
  {
    id: '7',
    title: 'Tamil Broadway Musical',
    description: 'A groundbreaking musical blending Tamil theater traditions with cutting-edge technology and contemporary storytelling.',
    date: '2025-11-22T19:30:00Z',
    venue: 'Sri Shanmukhananda Fine Arts',
    organizer: 'Tamil Theater Productions',
    image: 'https://images.unsplash.com/photo-1489599735734-79b4d4c4b5c?w=800&h=400&fit=crop',
    tags: ['musical', 'tamil', 'theater', 'performance'],
    price: 12500,
    capacity: 2000,
    availableSeats: 1100,
  },
  {
    id: '8',
    title: 'Gopinath Comedy Live',
    description: 'Tamil Nadu\'s favorite comedian Gopinath brings his hilarious takes on Chennai life and South Indian culture.',
    date: '2025-10-25T21:00:00Z',
    venue: 'VR Mall Chennai',
    organizer: 'Tamil Comedy Club',
    image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=800&h=400&fit=crop',
    tags: ['comedy', 'tamil', 'performance', 'local'],
    price: 8000,
    capacity: 2500,
    availableSeats: 1350,
  },
  {
    id: '9',
    title: 'Chennai Electronic Music Festival',
    description: 'A three-day extravaganza of electronic beats featuring international DJs and local talent in Marina Beach.',
    date: '2025-12-08T18:00:00Z',
    venue: 'Marina Beach Open Air Theater',
    organizer: 'Chennai EDM Collective',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
    tags: ['electronic', 'festival', 'music', 'concert'],
    price: 15000,
    capacity: 15000,
    availableSeats: 8900,
  },
  {
    id: '10',
    title: 'Shakespeare in Tamil',
    description: 'Timeless Shakespearean plays reimagined in Tamil with modern technology and traditional South Indian theater elements.',
    date: '2025-11-18T19:00:00Z',
    venue: 'Alliance Française Chennai',
    organizer: 'Chennai Shakespeare Society',
    image: 'https://images.unsplash.com/photo-1489599735734-79b4d4c4b5c?w=800&h=400&fit=crop',
    tags: ['theater', 'shakespeare', 'performance', 'tamil'],
    price: 5900,
    capacity: 900,
    availableSeats: 450,
  },
];

export const eventsApi = {
  getEvents: async (params?: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // Filter mock data based on params
    let filteredEvents = mockEvents;
    if (params?.type) {
      filteredEvents = filteredEvents.filter(event => event.tags.includes(params.type));
    }
    if (params?.city) {
      filteredEvents = filteredEvents.filter(event => event.venue.toLowerCase().includes(params.city.toLowerCase()));
    }
    if (params?.date) {
      filteredEvents = filteredEvents.filter(event => event.date.startsWith(params.date));
    }
    return filteredEvents;
  },
  getEvent: async (id: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    const event = mockEvents.find(e => e.id === id);
    if (!event) throw new Error('Event not found');
    return event;
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