export interface LoginResponse {
  message: string;
  user: AuthUser;
  accessToken: string;
}

export interface SignupResponse {
  message: string;
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  aud: string;
  role: string;
  email: string;
  email_confirmed_at?: string | null; // optional because signup response doesn't include this
  phone: string;
  confirmation_sent_at: string | null;
  confirmed_at?: string | null;
  last_sign_in_at?: string | null;
  app_metadata: AppMetadata;
  user_metadata: UserMetadata;
  identities: Identity[];
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
}

export interface AppMetadata {
  provider: string;
  providers: string[];
}

export interface UserMetadata {
  email: string;
  email_verified: boolean;
  full_name: string;
  phone_verified: boolean;
  sub: string;
}

export interface Identity {
  identity_id: string;
  id: string;
  user_id: string;
  identity_data: IdentityData;
  provider: string;
  last_sign_in_at: string;
  created_at: string;
  updated_at: string;
  email: string;
}

export interface IdentityData {
  email: string;
  email_verified: boolean;
  full_name: string;
  phone_verified: boolean;
  sub: string;
}
