import axios from 'axios';
import toast from 'react-hot-toast';

import { env } from '../config/env';
import { showApiToast } from './toast';

const TOAST_ID = 'api-toast';

const api = axios.create({ baseURL: env.apiURL, withCredentials: true });

api.interceptors.response.use(
  (response) => {
    if (response.data.title && response.data.message) {
      toast.dismiss(TOAST_ID);
      showApiToast(response.status, response.data.message, 4000, TOAST_ID);
    }

    return response;
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        toast.dismiss(TOAST_ID);
        showApiToast(503, 'No internet connection or server is unreachable.', 4000, TOAST_ID);
        return Promise.reject(error);
      }

      const statusCode = error.response?.status ?? 500;
      const message =
        error.response?.data.message ??
        'An error occurred while processing the request on the server side.';

      const isSilentEndpoint = ['/users/me'].includes(error.config?.url ?? '');

      if (!isSilentEndpoint && error.response?.data.title && error.response?.data.message) {
        toast.dismiss(TOAST_ID);
        showApiToast(statusCode, message, 4000, TOAST_ID);
      }
    } else {
      toast.dismiss(TOAST_ID);
      showApiToast(
        500,
        'An error occurred while connecting to process the request to the server.',
        4000,
        TOAST_ID,
      );
    }

    return Promise.reject(error);
  },
);

export default api;
