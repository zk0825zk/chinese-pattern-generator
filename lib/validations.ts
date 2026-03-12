const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

export function validateUsername(username: string): string | null {
  if (username.length < 3 || username.length > 20) {
    return '用户名长度需在 3-20 字符之间';
  }
  if (!USERNAME_REGEX.test(username)) {
    return '用户名仅允许字母、数字和下划线';
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return '密码长度至少 8 字符';
  }
  return null;
}
