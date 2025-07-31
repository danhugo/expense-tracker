export interface User {
  id: number;
  name: string;
  email: string;
  profile_picture_url?: string;
  currency: string;
  currency_symbol: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  position: 'before' | 'after';
}

export interface UserUpdate {
  name?: string;
  email?: string;
  password?: string;
  profile_picture_url?: string;
  currency?: string;
  currency_symbol?: string;
}