// ===== 通用 =====
export interface ApiError {
  error: string;
}

// ===== 认证 =====
export interface AuthUser {
  id: string;
  username: string;
}

export interface AuthUserFull extends AuthUser {
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface MeResponse {
  user: AuthUserFull;
}

// ===== 纹样 =====
export interface PatternListItem {
  id: string;
  name: string;
  type: string;
  thumbnail: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PatternDetail extends PatternListItem {
  params: string;
  svg: string;
  outputFormat: string;
  userId: string;
}

export interface PatternListResponse {
  data: PatternListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface CreatePatternRequest {
  name?: string;
  type: string;
  params: string;
  svg: string;
  outputFormat?: string;
  thumbnail?: string;
}

export interface CreatePatternResponse {
  pattern: PatternDetail;
}

export interface PatternDetailResponse {
  pattern: PatternDetail;
}

export interface DeletePatternResponse {
  success: boolean;
}
