import api from './api';

const MOCK_PUBLISHED_EVENTS = [
  {
    id: 'evt-101',
    name: 'Neon Sunset Electronic Music Festival',
    category: 'Concert',
    artistOrHost: 'DJ KSHMR & Nucleya ft. Lost Stories',
    date: '2026-08-23T20:00:00.000Z',
    venue: 'Sunburn Arena, Mahalaxmi Racecourse, Mumbai',
    ticketPrice: 499,
    ticketsAvailable: 380,
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'evt-102',
    name: 'Midnight Retro Groove & Techno Night',
    category: 'Party',
    artistOrHost: 'DJ Pearl & Anish Sood',
    date: '2026-08-29T21:30:00.000Z',
    venue: 'Prism Club & Kitchen, Gachibowli, Hyderabad',
    ticketPrice: 799,
    ticketsAvailable: 120,
    coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'evt-103',
    name: 'Indie Rock Unplugged Live in Concert',
    category: 'Concert',
    artistOrHost: 'When Chai Met Toast & Local Train',
    date: '2026-09-05T19:00:00.000Z',
    venue: 'JLN Stadium Grounds, New Delhi',
    ticketPrice: 999,
    ticketsAvailable: 450,
    coverImage: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'evt-104',
    name: 'Full Moon Beach Rave & Pool Party',
    category: 'Party',
    artistOrHost: 'Hosted by Sunburn Goa Beach Club',
    date: '2026-09-12T22:00:00.000Z',
    venue: 'Anjuna Beach Front, North Goa',
    ticketPrice: 1299,
    ticketsAvailable: 0, // Sold Out test
    coverImage: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'evt-105',
    name: 'High Octane Metal & Rock Odyssey',
    category: 'Concert',
    artistOrHost: 'Bloodywood ft. Girish & The Chronicles',
    date: '2026-09-18T18:30:00.000Z',
    venue: 'Phoenix Marketcity Amphitheatre, Bengaluru',
    ticketPrice: 699,
    ticketsAvailable: 215,
    coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'evt-106',
    name: 'Bollywood Blockbuster DJ Night & Club Crawl',
    category: 'Party',
    artistOrHost: 'DJ Chetas & DJ Shadow Dubai',
    date: '2026-09-25T21:00:00.000Z',
    venue: 'Tryst Nightclub, Lower Parel, Mumbai',
    ticketPrice: 1499,
    ticketsAvailable: 64,
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
  },
];

const eventService = {
  getPublishedEvents: async () => {
    try {
      const response = await api.get('/events?status=published');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      return MOCK_PUBLISHED_EVENTS;
    } catch (error) {
      console.warn('Backend API request failed or offline. Using concert/party mock data.', error?.message || error);
      return MOCK_PUBLISHED_EVENTS;
    }
  },

  getEventById: async (id) => {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data;
    } catch (error) {
      const found = MOCK_PUBLISHED_EVENTS.find((e) => e.id === id);
      if (found) return found;
      throw new Error(`Event with ID ${id} not found.`);
    }
  },
};

export default eventService;
