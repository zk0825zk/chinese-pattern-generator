import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  MeResponse,
  PatternListResponse,
  CreatePatternRequest,
  CreatePatternResponse,
  PatternDetailResponse,
  DeletePatternResponse,
} from './api-types';

const TOKEN_KEY = 'auth_token';

// ===== Token 管理 =====

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ===== 请求封装 =====

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(path, { ...options, headers });

  if (res.status === 401) {
    removeToken();
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: '请求失败' }));
    throw new ApiClientError(body.error ?? '请求失败', res.status);
  }

  return res.json();
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

// ===== 认证 API =====

export const authApi = {
  register(data: RegisterRequest): Promise<AuthResponse> {
    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login(data: LoginRequest): Promise<AuthResponse> {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  me(): Promise<MeResponse> {
    return request('/api/auth/me');
  },
};

// ===== 纹样 API =====

export const patternsApi = {
  list(page = 1, limit = 20): Promise<PatternListResponse> {
    return request(`/api/patterns?page=${page}&limit=${limit}`);
  },

  get(id: string): Promise<PatternDetailResponse> {
    return request(`/api/patterns/${id}`);
  },

  create(data: CreatePatternRequest): Promise<CreatePatternResponse> {
    return request('/api/patterns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  delete(id: string): Promise<DeletePatternResponse> {
    return request(`/api/patterns/${id}`, { method: 'DELETE' });
  },
};
