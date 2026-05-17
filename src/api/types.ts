export class ApiError extends Error {
  status?: number;
  code?: number;
  data?: unknown;

  constructor(
    message: string,
    status?: number,
    code?: number,
    data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

export interface TokenOut {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
  refresh_token: string;
}

export interface RegisterIn {
  username: string;
  password: string;
}

export interface RegisterOut {
  id: number;
  username: string;
}

export interface LoginIn {
  username: string;
  password: string;
}

export interface RefreshIn {
  refresh_token: string;
}

export interface LogoutIn {
  refresh_token: string;
}

export interface FastAPIValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface FastAPIErrorBody {
  detail?: string | FastAPIValidationError[];
}

export interface WorkOut {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface WorkCreate {
  title: string;
}

export interface WorkUpdate {
  title: string;
}

export type DocumentStatus = 'pending' | 'done' | 'failed';

export interface DocumentOut {
  id: number;
  work_id: number;
  filename: string;
  content_type: string;
  size_bytes: number;
  status: DocumentStatus;
  chunk_count: number;
  error_message: string | null;
  created_at: string;
}
