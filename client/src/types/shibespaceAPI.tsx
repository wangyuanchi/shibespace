export interface ErrorResponse {
  error: string;
}

export interface UserData {
  username: string;
  password: string;
}

export interface UserInfo {
  id: string;
  username: string;
}

export interface User {
  username: string;
}

export interface Thread {
  id: number;
  title: string;
  content: string;
  tags: string[];
  creator_id: string;
  created_timestamp: string;
  updated_timestamp: string;
}
