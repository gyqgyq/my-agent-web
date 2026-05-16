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
