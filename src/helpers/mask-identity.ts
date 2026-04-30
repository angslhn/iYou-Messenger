export const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');

  if (!local || !domain) return email;

  const masked = local[0] + '*'.repeat(local.length - 1);
  return `${masked}@${domain}`;
};

export const maskPhone = (phone: string): string => {
  if (phone.length < 4) return phone;

  return '*'.repeat(phone.length - 4) + phone.slice(-4);
};
