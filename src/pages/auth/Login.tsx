import { Link } from 'react-router-dom';

import AuthLayout from '../../components/layouts/AuthLayout';
import LoginForm from '../../components/forms/LoginForm';

import type { JSX } from 'react';

export default function Login(): JSX.Element {
  return (
    <AuthLayout is_page="login">
      <LoginForm />
      <div className="mt-8 flex justify-center gap-1 text-center text-platinum">
        <span className="text-sm">You don't have an account yet?</span>
        <Link to="/register" className="text-sm font-semibold hover:underline">
          Register now
        </Link>
      </div>
    </AuthLayout>
  );
}
