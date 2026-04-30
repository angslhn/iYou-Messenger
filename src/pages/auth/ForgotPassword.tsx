import AuthLayout from '../../components/layouts/AuthLayout';
import ForgotPasswordForm from '../../components/forms/ForgotPasswordForm';

import type { JSX } from 'react';

export default function ForgotPassword(): JSX.Element {
  return (
    <AuthLayout is_page="forgot_password">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
