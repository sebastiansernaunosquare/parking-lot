export interface Raffle {
  id: string;
  period: string;
  status: 'OPEN' | 'CLOSED' | 'COMPLETED';
  totalSpots: number;
}