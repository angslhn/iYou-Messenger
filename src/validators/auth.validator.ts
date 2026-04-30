import * as Input from './input.validator';

import type { Form } from '../@types/globals';

export function register({ fullname, username, email, password }: Omit<Form, 'identifier'>) {
  const checkFullname = Input.fullname(fullname);
  const checkUsername = Input.username(username);
  const checkEmail = Input.email(email);
  const checkPassword = Input.password(password);

  if (checkFullname || checkUsername || checkEmail || checkPassword) {
    return {
      ...(checkFullname && { fullname: checkFullname }),
      ...(checkUsername && { username: checkUsername }),
      ...(checkEmail && { email: checkEmail }),
      ...(checkPassword && { password: checkPassword }),
    };
  }

  return null;
}

export function login({ identifier, password }: Omit<Form, 'fullname' | 'username' | 'email'>) {
  const checkIdentifier = !identifier.trim();
  const checkPassword = !password.trim();

  if (checkIdentifier || checkPassword) {
    return {
      ...(checkIdentifier && { identifier: 'Account identifier cannot be empty' }),
      ...(checkPassword && { password: 'Password is required' }),
    };
  }

  return null;
}

export function forgotPassword(identifier: string) {
  if (!identifier.trim()) {
    return 'Account identifier cannot be empty';
  }

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  const isPhone = /^\+?[0-9]{8,15}$/.test(identifier);

  if (!isEmail && !isPhone) {
    return 'Invalid email or phone number format';
  }

  return null;
}

export function resetPassword({ new_password }: Record<'new_password', string>) {
  let checkNewPassword = Input.password(new_password);

  if (new_password === '') {
    checkNewPassword = 'The new password cannot be empty';
  }

  if (checkNewPassword) return { new_password: checkNewPassword };

  return null;
}
