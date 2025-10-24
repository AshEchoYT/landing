import axios from 'axios';

const API_BASE = '/api';

// Mock data for events
const mockEvents = [
  {
    id: '1',
    title: 'Neon Nights Festival',
    description: 'An electrifying music festival featuring top DJs and neon-lit performances under the stars.',
    date: '2025-11-15T20:00:00Z',
    venue: 'Echo Arena',
    organizer: 'Events.Echo',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
    tags: ['music', 'festival', 'electronic'],
    price: 89.99,
    capacity: 5000,
    availableSeats: 2450,
  },
  {
    id: '2',
    title: 'Cyber Punk Theater Show',
    description: 'Immerse yourself in a futuristic theater experience with holographic projections and cyber punk aesthetics.',
    date: '2025-12-01T19:30:00Z',
    venue: 'Digital Theater',
    organizer: 'Future Arts',
    image: 'https://images.unsplash.com/photo-1489599735734-79b4d4c4b5c?w=800&h=400&fit=crop',
    tags: ['theater', 'cyberpunk', 'immersive'],
    price: 65.00,
    capacity: 800,
    availableSeats: 320,
  },
  {
    id: '3',
    title: 'Synthwave Concert',
    description: 'Retro-futuristic synthwave music with stunning visual effects and laser shows.',
    date: '2025-10-30T21:00:00Z',
    venue: 'Neon Club',
    organizer: 'RetroWave Productions',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=400&fit=crop',
    tags: ['concert', 'synthwave', 'retro'],
    price: 45.00,
    capacity: 1200,
    availableSeats: 890,
  },
  {
    id: '4',
    title: 'AI Art Exhibition',
    description: 'Explore the intersection of artificial intelligence and contemporary art in this groundbreaking exhibition.',
    date: '2025-11-20T10:00:00Z',
    venue: 'Tech Gallery',
    organizer: 'AI Collective',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop',
    tags: ['art', 'exhibition', 'AI'],
    price: 25.00,
    capacity: 300,
    availableSeats: 150,
  },
  {
    id: '5',
    title: 'Virtual Reality Gaming Tournament',
    description: 'Compete in the ultimate VR gaming championship with cutting-edge technology and massive prizes.',
    date: '2025-12-10T14:00:00Z',
    venue: 'VR Arena',
    organizer: 'GameVerse',
    image: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=800&h=400&fit=crop',
    tags: ['gaming', 'VR', 'tournament'],
    price: 35.00,
    capacity: 2000,
    availableSeats: 1200,
  },
  {
    id: '6',
    title: 'Holographic Dance Performance',
    description: 'Witness mesmerizing dance routines enhanced by holographic technology and immersive lighting.',
    date: '2025-11-05T20:00:00Z',
    venue: 'Holo Stage',
    organizer: 'Dance Dimensions',
    image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=800&h=400&fit=crop',
    tags: ['dance', 'holographic', 'performance'],
    price: 55.00,
    capacity: 600,
    availableSeats: 280,
  },
  {
    id: '7',
    title: 'Quantum Physics Lecture Series',
    description: 'Dive deep into the mysteries of quantum mechanics with world-renowned physicists and interactive demonstrations.',
    date: '2025-11-25T18:00:00Z',
    venue: 'Science Hub',
    organizer: 'Quantum Institute',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop',
    tags: ['science', 'lecture', 'quantum'],
    price: 15.00,
    capacity: 400,
    availableSeats: 180,
  },
  {
    id: '8',
    title: 'Metaverse Fashion Show',
    description: 'Experience the future of fashion in the metaverse with virtual avatars and augmented reality displays.',
    date: '2025-12-05T19:00:00Z',
    venue: 'MetaVerse Plaza',
    organizer: 'Digital Couture',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=400&fit=crop',
    tags: ['fashion', 'metaverse', 'AR'],
    price: 75.00,
    capacity: 1000,
    availableSeats: 650,
  },
  {
    id: '9',
    title: 'Blockchain & Crypto Conference',
    description: 'The premier conference for blockchain technology, cryptocurrency, and decentralized finance innovations.',
    date: '2025-11-12T09:00:00Z',
    venue: 'Crypto Center',
    organizer: 'BlockChain Alliance',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop',
    tags: ['blockchain', 'crypto', 'conference'],
    price: 199.00,
    capacity: 1500,
    availableSeats: 890,
  },
  {
    id: '10',
    title: 'Space Exploration Symposium',
    description: 'Join astronauts, engineers, and visionaries discussing the future of human space exploration.',
    date: '2025-12-15T13:00:00Z',
    venue: 'Astro Dome',
    organizer: 'Space Frontier',
    image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=400&fit=crop',
    tags: ['space', 'exploration', 'symposium'],
    price: 120.00,
    capacity: 800,
    availableSeats: 420,
  },
  {
    id: '11',
    title: 'Neon Glow Running Race',
    description: 'A spectacular night race with glowing participants, LED obstacles, and electronic music atmosphere.',
    date: '2025-10-28T22:00:00Z',
    venue: 'Urban Circuit',
    organizer: 'Glow Runners',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
    tags: ['sports', 'running', 'neon'],
    price: 40.00,
    capacity: 2000,
    availableSeats: 1450,
  },
  {
    id: '12',
    title: 'Digital Art Auction',
    description: 'Bid on exclusive digital artworks, NFTs, and collectibles from renowned digital artists.',
    date: '2025-11-30T20:00:00Z',
    venue: 'Digital Gallery',
    organizer: 'NFT Marketplace',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
    tags: ['art', 'auction', 'NFT'],
    price: 0.00,
    capacity: 500,
    availableSeats: 300,
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