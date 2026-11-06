export interface WorldClockCity {
  id: string;
  name: string;
  country: string;
  timeZone: string;
}

export const WORLD_CLOCK_CITIES: WorldClockCity[] = [
  { id: 'nairobi', name: 'Nairobi', country: 'Kenya', timeZone: 'Africa/Nairobi' },
  { id: 'kampala', name: 'Kampala', country: 'Uganda', timeZone: 'Africa/Kampala' },
  { id: 'dar-es-salaam', name: 'Dar es Salaam', country: 'Tanzania', timeZone: 'Africa/Dar_es_Salaam' },
  { id: 'johannesburg', name: 'Johannesburg', country: 'South Africa', timeZone: 'Africa/Johannesburg' },
  { id: 'cairo', name: 'Cairo', country: 'Egypt', timeZone: 'Africa/Cairo' },
  { id: 'lagos', name: 'Lagos', country: 'Nigeria', timeZone: 'Africa/Lagos' },
  { id: 'london', name: 'London', country: 'United Kingdom', timeZone: 'Europe/London' },
  { id: 'paris', name: 'Paris', country: 'France', timeZone: 'Europe/Paris' },
  { id: 'berlin', name: 'Berlin', country: 'Germany', timeZone: 'Europe/Berlin' },
  { id: 'istanbul', name: 'Istanbul', country: 'Türkiye', timeZone: 'Europe/Istanbul' },
  { id: 'moscow', name: 'Moscow', country: 'Russia', timeZone: 'Europe/Moscow' },
  { id: 'dubai', name: 'Dubai', country: 'United Arab Emirates', timeZone: 'Asia/Dubai' },
  { id: 'mumbai', name: 'Mumbai', country: 'India', timeZone: 'Asia/Kolkata' },
  { id: 'dhaka', name: 'Dhaka', country: 'Bangladesh', timeZone: 'Asia/Dhaka' },
  { id: 'bangkok', name: 'Bangkok', country: 'Thailand', timeZone: 'Asia/Bangkok' },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', timeZone: 'Asia/Singapore' },
  { id: 'hong-kong', name: 'Hong Kong', country: 'China', timeZone: 'Asia/Hong_Kong' },
  { id: 'shanghai', name: 'Shanghai', country: 'China', timeZone: 'Asia/Shanghai' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', timeZone: 'Asia/Tokyo' },
  { id: 'seoul', name: 'Seoul', country: 'South Korea', timeZone: 'Asia/Seoul' },
  { id: 'sydney', name: 'Sydney', country: 'Australia', timeZone: 'Australia/Sydney' },
  { id: 'auckland', name: 'Auckland', country: 'New Zealand', timeZone: 'Pacific/Auckland' },
  { id: 'los-angeles', name: 'Los Angeles', country: 'United States', timeZone: 'America/Los_Angeles' },
  { id: 'denver', name: 'Denver', country: 'United States', timeZone: 'America/Denver' },
  { id: 'chicago', name: 'Chicago', country: 'United States', timeZone: 'America/Chicago' },
  { id: 'new-york', name: 'New York', country: 'United States', timeZone: 'America/New_York' },
  { id: 'toronto', name: 'Toronto', country: 'Canada', timeZone: 'America/Toronto' },
  { id: 'vancouver', name: 'Vancouver', country: 'Canada', timeZone: 'America/Vancouver' },
  { id: 'mexico-city', name: 'Mexico City', country: 'Mexico', timeZone: 'America/Mexico_City' },
  { id: 'sao-paulo', name: 'São Paulo', country: 'Brazil', timeZone: 'America/Sao_Paulo' },
  { id: 'buenos-aires', name: 'Buenos Aires', country: 'Argentina', timeZone: 'America/Argentina/Buenos_Aires' },
  { id: 'utc', name: 'UTC', country: 'Coordinated Universal Time', timeZone: 'UTC' },
];
