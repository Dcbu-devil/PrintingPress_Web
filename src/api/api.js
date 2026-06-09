import axios from 'axios';

/*
  ============================================================
  API CONFIGURATION FILE
  ============================================================

  Purpose:
  This file creates one common Axios instance for the whole frontend.

  Why we need this:
  Instead of writing full backend URL again and again like:

      axios.get('http://127.0.0.1:8000/api/orders/')

  We can simply write:

      api.get('/orders/')

  This makes the code clean and easy to maintain.
*/


/*
  ============================================================
  CREATE AXIOS INSTANCE
  ============================================================

  baseURL:
  This is the backend API base URL.

  Local development backend:
      http://127.0.0.1:8000/api

  Example:
      api.get('/payments/')

  Final request becomes:
      http://127.0.0.1:8000/api/payments/

  VITE_API_URL:
  Later, when you deploy the project, you can set backend URL in .env file:

      VITE_API_URL=https://your-backend-url.com/api

  If VITE_API_URL is not found, it will use local backend URL.
*/

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',

  headers: {
    'Content-Type': 'application/json',
  },
});


/*
  ============================================================
  REQUEST INTERCEPTOR
  ============================================================

  Purpose:
  This automatically attaches JWT token to every API request.

  After successful login, we store token in localStorage:

      localStorage.setItem('token', access_token)

  Then this interceptor reads the token and adds it to request header:

      Authorization: Bearer token_here

  So protected backend APIs can identify the logged-in user.

  Example protected API:
      GET /api/auth/me
      PUT /api/payments/1/pay
      POST /api/orders/

  Without token:
      Backend returns 401 Not authenticated

  With token:
      Backend allows request based on user role.
*/

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


/*
  ============================================================
  RESPONSE INTERCEPTOR
  ============================================================

  Purpose:
  This handles common API response errors globally.

  If backend returns 401 Unauthorized:
  - Token may be missing, invalid, or expired.
  - We remove old token and user from localStorage.
  - User will need to login again.

  This helps prevent broken login sessions.
*/

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    return Promise.reject(error);
  }
);


/*
  ============================================================
  EXPORT API INSTANCE
  ============================================================

  Now use this api object in all frontend pages:

      import api from '../api/api';

      const response = await api.get('/orders/');
      const response = await api.post('/auth/login', data);
      const response = await api.put('/payments/1/pay', data);
*/

export default api;