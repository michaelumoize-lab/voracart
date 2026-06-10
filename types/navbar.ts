export interface NavbarUser {
  id: string;
  name?: string | null;
  email?: string;
  image?: string | null;
  role?: string;
}

export interface NavbarSession {
  user?: NavbarUser | null;
}