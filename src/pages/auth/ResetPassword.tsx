import AuthLayout from '../../components/layouts/AuthLayout';
import ResetPasswordForm from '../../components/forms/ResetPasswordForm';

import type { JSX } from 'react';

export default function ResetPassword(): JSX.Element {
  return (
    <AuthLayout is_page="reset_password">
      <ResetPasswordForm />
    </AuthLayout>
  );
}
