// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { validateUsername, validatePassword } from '@/lib/validations';

describe('validateUsername', () => {
  it('accepts valid usernames', () => {
    expect(validateUsername('alice')).toBeNull();
    expect(validateUsername('user_123')).toBeNull();
    expect(validateUsername('Bob')).toBeNull();
  });

  it('rejects too short usernames', () => {
    expect(validateUsername('ab')).toBe('用户名长度需在 3-20 字符之间');
  });

  it('rejects too long usernames', () => {
    expect(validateUsername('a'.repeat(21))).toBe('用户名长度需在 3-20 字符之间');
  });

  it('rejects invalid characters', () => {
    expect(validateUsername('user name')).toBe('用户名仅允许字母、数字和下划线');
    expect(validateUsername('user@name')).toBe('用户名仅允许字母、数字和下划线');
  });
});

describe('validatePassword', () => {
  it('accepts valid passwords', () => {
    expect(validatePassword('12345678')).toBeNull();
    expect(validatePassword('a very long password is fine')).toBeNull();
  });

  it('rejects too short passwords', () => {
    expect(validatePassword('1234567')).toBe('密码长度至少 8 字符');
  });
});
