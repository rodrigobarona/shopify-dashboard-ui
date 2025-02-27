// Session related types
export type SessionParams = {
  id: string;
  shop: string;
  state: string;
  isOnline: boolean;
  scope: string;
  accessToken: string;
  [key: string]: unknown; // For any additional properties
};
