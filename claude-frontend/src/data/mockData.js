// Centralized mock data + seed helpers. All persistence is via localStorage.
// This is DEMO data only — no real backend, no real payments, no real verification.

export const VEHICLE_TYPES = [
  { id: 'hatchback_sedan', label: 'Hatchback / Sedan', icon: 'directions_car' },
  { id: 'suv', label: 'SUV / Crossover', icon: 'airport_shuttle' },
  { id: 'two_wheeler', label: '2-Wheeler', icon: 'two_wheeler' },
  { id: 'ev', label: 'EV', icon: 'electric_car' },
]

export const PARKING_TYPES = ['Basement', 'Stilt', 'Open', 'Covered']

export const FEATURES = [
  { id: 'covered', label: 'Covered', icon: 'garage' },
  { id: 'cctv', label: 'CCTV', icon: 'videocam' },
  { id: 'ev_charging', label: 'EV Charging', icon: 'ev_station' },
  { id: 'security', label: 'Security Guard', icon: 'shield' },
  { id: 'well_lit', label: 'Well Lit', icon: 'light_mode' },
]

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const MOCK_USERS = [
  { id: 'u_driver_1', name: 'Aditya Rao', email: 'driver@parkshare.demo', phone: '+91 98765 43210', password: 'demo1234', role: 'DRIVER', vehicle: 'Hatchback', vehicleNumber: 'DL 4C AB 1234', status: 'Verified' },
  { id: 'u_owner_1', name: 'Priya Nair', email: 'owner@parkshare.demo', phone: '+91 91234 56789', password: 'demo1234', role: 'OWNER', status: 'Verified' },
  { id: 'u_admin_1', name: 'System Admin', email: 'admin@parkshare.demo', phone: '+91 90000 00000', password: 'demo1234', role: 'ADMIN', status: 'Verified' },
]

export const MOCK_PARKING_SPACES = [
  {
    id: 'p1',
    ownerId: 'u_owner_1',
    title: 'Green Valley Residency',
    society: 'Green Valley Residency',
    address: 'Sector 62, Noida',
    city: 'Noida',
    lat: 28.6274, lng: 77.3716,
    image: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?q=80&w=800&auto=format&fit=crop',
    type: 'Covered',
    vehicleTypes: ['hatchback_sedan', 'suv'],
    pricePerHour: 30,
    dayPass: 220,
    rating: 4.8,
    reviews: 132,
    distanceKm: 0.4,
    walkMins: 5,
    availableHours: '6:00 AM – 11:00 PM',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    features: ['covered', 'cctv', 'security'],
    description: 'Secure covered parking slot inside a gated residency, close to the main market and metro station.',
    status: 'Active',
    host: { name: 'Priya Nair', memberSince: 2022, responseRate: '96%' },
  },
  {
    id: 'p2',
    ownerId: 'u_owner_1',
    title: 'Tech Heights',
    society: 'Tech Heights',
    address: 'Sector 63, Noida',
    city: 'Noida',
    lat: 28.6142, lng: 77.3910,
    image: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?q=80&w=800&auto=format&fit=crop',
    type: 'Basement',
    vehicleTypes: ['hatchback_sedan', 'suv', 'ev'],
    pricePerHour: 40,
    dayPass: 280,
    rating: 4.7,
    reviews: 98,
    distanceKm: 0.8,
    walkMins: 9,
    availableHours: '24/7',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    features: ['covered', 'cctv', 'ev_charging', 'well_lit'],
    description: 'Basement parking with EV charging point, available round the clock with CCTV coverage.',
    status: 'Active',
    host: { name: 'Priya Nair', memberSince: 2021, responseRate: '92%' },
  },
  {
    id: 'p3',
    ownerId: 'u_owner_2',
    title: 'Park Avenue',
    society: 'Park Avenue Apartments',
    address: 'Sector 61, Noida',
    city: 'Noida',
    lat: 28.6088, lng: 77.3623,
    image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=800&auto=format&fit=crop',
    type: 'Open',
    vehicleTypes: ['two_wheeler', 'hatchback_sedan'],
    pricePerHour: 25,
    dayPass: 180,
    rating: 4.9,
    reviews: 210,
    distanceKm: 1.1,
    walkMins: 13,
    availableHours: '7:00 AM – 10:00 PM',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    features: ['well_lit'],
    description: 'Open-air parking spot in a quiet residential lane, ideal for bikes and small cars.',
    status: 'Active',
    host: { name: 'Rohit Sharma', memberSince: 2023, responseRate: '88%' },
  },
  {
    id: 'p4',
    ownerId: 'u_owner_1',
    title: 'Sunshine Society',
    society: 'Sunshine Society',
    address: 'Sector 50, Noida',
    city: 'Noida',
    lat: 28.5751, lng: 77.3568,
    image: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?q=80&w=800&auto=format&fit=crop',
    type: 'Stilt',
    vehicleTypes: ['suv', 'hatchback_sedan'],
    pricePerHour: 35,
    dayPass: 250,
    rating: 4.6,
    reviews: 64,
    distanceKm: 2.3,
    walkMins: 27,
    availableHours: '6:00 AM – 12:00 AM',
    availableDays: ['Saturday', 'Sunday'],
    features: ['covered', 'security'],
    description: 'Stilt parking with dedicated security guard on weekends, close to the community park.',
    status: 'Active',
    host: { name: 'Priya Nair', memberSince: 2022, responseRate: '96%' },
  },
]

export const seedIfEmpty = () => {
  if (!localStorage.getItem('ps_users')) {
    localStorage.setItem('ps_users', JSON.stringify(MOCK_USERS))
  }
  if (!localStorage.getItem('ps_parking')) {
    localStorage.setItem('ps_parking', JSON.stringify(MOCK_PARKING_SPACES))
  }
  if (!localStorage.getItem('ps_bookings')) {
    localStorage.setItem('ps_bookings', JSON.stringify([]))
  }
  if (!localStorage.getItem('ps_favorites')) {
    localStorage.setItem('ps_favorites', JSON.stringify([]))
  }
  if (!localStorage.getItem('ps_payments')) {
    localStorage.setItem('ps_payments', JSON.stringify([]))
  }
}

export const uid = (prefix = 'id') => `${prefix}_${Math.random().toString(36).slice(2, 9)}`
