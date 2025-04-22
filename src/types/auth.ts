export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  status: boolean;
  token: string;
  user: User;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface QrCode {
  uniqued_id: string;
}

