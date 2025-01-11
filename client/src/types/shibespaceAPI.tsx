export interface ErrorResponse {
  error: string;
}

export interface User {
  username: string;
}

export interface UserInfo {
  id: string;
  username: string;
}

export interface UserData {
  username: string;
  password: string;
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

export interface ThreadData {
  title: string;
  content: string;
  tags: string[];
}

export interface ThreadContent {
  content: string;
}

export interface Comment {
  id: number;
  content: string;
  thread_id: number;
  creator_id: string;
  created_timestamp: string;
  updated_timestamp: string;
}

export interface CommentContent {
  content: string;
}
