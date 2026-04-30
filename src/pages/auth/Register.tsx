import { Link } from 'react-router-dom';

import RegisterForm from '../../components/forms/RegisterForm';
import AuthLayout from '../../components/layouts/AuthLayout';

import type { JSX } from 'react';

export default function Register(): JSX.Element {
  return (
    <AuthLayout is_page="register">
      <RegisterForm />
      <div className="mt-8 flex justify-center gap-1 text-center text-platinum">
        <span className="text-sm">Do you already have an account?</span>
        <Link to="/login" className="text-sm font-semibold hover:underline">
          Login
        </Link>
      </div>
    </AuthLayout>
  );
}
