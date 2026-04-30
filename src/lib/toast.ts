import toast from 'react-hot-toast';

const toastStyle = {
  background: '#141414',
  color: '#e8e8e8',
  border: '1px solid #2a2a2a',
  borderRadius: '12px',
  fontSize: '13px',
  fontWeight: '500',
  padding: '10px 14px',
} as const;

function getToastConfig(statusCode: number) {
  if (statusCode >= 200 && statusCode < 300) {
    return { fn: toast.success };
  } else if (statusCode >= 300 && statusCode < 500) {
    return { fn: toast, icon: '⚠️' };
  } else {
    return { fn: toast.error };
  }
}

export function showApiToast(
  statusCode: number,
  message: string,
  delay: number = 4000,
  id?: string,
) {
  const { fn, icon } = getToastConfig(statusCode);

  fn(message, {
    id,
    style: toastStyle,
    duration: delay,
    ...(icon && { icon }),
  });

  return new Promise((resolve) => setTimeout(resolve, delay));
}
