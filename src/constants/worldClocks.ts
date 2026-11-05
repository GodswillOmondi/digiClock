export interface WorldClockCity {
  id: string;
  name: string;
  region: string;
  timeZone: string;
}

export const WORLD_CLOCK_CITIES: WorldClockCity[] = [
  { id: 'nairobi', name: 'Nairobi', region: 'Kenya', timeZone: 'Africa/Nairobi' },
  { id: 'kampala', name: 'Kampala', region: 'Uganda', timeZone: 'Africa/Kampala' },
  { id: 'dar-es-salaam', name: 'Dar es Salaam', region: 'Tanzania', timeZone: 'Africa/Dar_es_Salaam' },
  { id: 'johannesburg', name: 'Johannesburg', region: 'South Africa', timeZone: 'Africa/Johannesburg' },
  { id: 'cairo', name: 'Cairo', region: 'Egypt', timeZone: 'Africa/Cairo' },
  { id: 'lagos', name: 'Lagos', region: 'Nigeria', timeZone: 'Africa/Lagos' },
  { id: 'london', name: 'London', region: 'United Kingdom', timeZone: 'Europe/London' },
  { id: 'paris', name: 'Paris', region: 'France', timeZone: 'Europe/Paris' },
  { id: 'berlin', name: 'Berlin', region: 'Germany', timeZone: 'Europe/Berlin' },
  { id: 'istanbul', name: 'Istanbul', region: 'Türkiye', timeZone: 'Europe/Istanbul' },
  { id: 'moscow', name: 'Moscow', region: 'Russia', timeZone: 'Europe/Moscow' },
  { id: 'dubai', name: 'Dubai', region: 'United Arab Emirates', timeZone: 'Asia/Dubai' },
  { id: 'mumbai', name: 'Mumbai', region: 'India', timeZone: 'Asia/Kolkata' },
  { id: 'dhaka', name: 'Dhaka', region: 'Bangladesh', timeZone: 'Asia/Dhaka' },
  { id: 'bangkok', name: 'Bangkok', region: 'Thailand', timeZone: 'Asia/Bangkok' },
  { id: 'singapore', name: 'Singapore', region: 'Singapore', timeZone: 'Asia/Singapore' },
  { id: 'hong-kong', name: 'Hong Kong', region: 'China', timeZone: 'Asia/Hong_Kong' },
  { id: 'shanghai', name: 'Shanghai', region: 'China', timeZone: 'Asia/Shanghai' },
  { id: 'tokyo', name: 'Tokyo', region: 'Japan', timeZone: 'Asia/Tokyo' },
  { id: 'seoul', name: 'Seoul', region: 'South Korea', timeZone: 'Asia/Seoul' },
  { id: 'sydney', name: 'Sydney', region: 'Australia', timeZone: 'Australia/Sydney' },
  { id: 'auckland', name: 'Auckland', region: 'New Zealand', timeZone: 'Pacific/Auckland' },
  { id: 'los-angeles', name: 'Los Angeles', region: 'United States', timeZone: 'America/Los_Angeles' },
  { id: 'denver', name: 'Denver', region: 'United States', timeZone: 'America/Denver' },
  { id: 'chicago', name: 'Chicago', region: 'United States', timeZone: 'America/Chicago' },
  { id: 'new-york', name: 'New York', region: 'United States', timeZone: 'America/New_York' },
  { id: 'toronto', name: 'Toronto', region: 'Canada', timeZone: 'America/Toronto' },
  { id: 'vancouver', name: 'Vancouver', region: 'Canada', timeZone: 'America/Vancouver' },
  { id: 'mexico-city', name: 'Mexico City', region: 'Mexico', timeZone: 'America/Mexico_City' },
  { id: 'sao-paulo', name: 'São Paulo', region: 'Brazil', timeZone: 'America/Sao_Paulo' },
  { id: 'buenos-aires', name: 'Buenos Aires', region: 'Argentina', timeZone: 'America/Argentina/Buenos_Aires' },
  { id: 'utc', name: 'UTC', region: 'Coordinated Universal Time', timeZone: 'UTC' },
];
