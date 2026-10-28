import api from './api.js';

export default {
  signup: (payload) => api.post('/auth/signup', payload).then((r) => r.data),
  resendOtp: (payload) => api.post('/auth/otp/resend', payload).then((r) => r.data),
  verifySignup: (payload) => api.post('/auth/signup/verify', payload).then((r) => r.data),
  login: (email, password) => api.post('/auth/login', { email, password }).then((r) => r.data),
  signupPhone: (payload) => api.post('/auth/signup/phone', payload).then((r) => r.data),
  loginPhone: (payload) => api.post('/auth/login/phone', payload).then((r) => r.data),
  forgotPhoneReset: (payload) => api.post('/auth/forgot/phone', payload).then((r) => r.data),
  google: (payload) => api.post('/auth/google', payload).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  forgotRequest: (email) => api.post('/auth/forgot/request', { email }).then((r) => r.data),
  forgotVerify: (email, code) => api.post('/auth/forgot/verify', { email, code }).then((r) => r.data),
  forgotReset: (resetToken, newPassword) =>
    api.post('/auth/forgot/reset', { resetToken, newPassword }).then((r) => r.data),
};
