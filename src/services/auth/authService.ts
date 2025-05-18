import axiosInstance from "../api/apiInstance";

export const login = async (code: string) => {
  const response = await axiosInstance.get(`/auth/callback?code=${code}`);
  const { access_token, refresh_token, user_data } = response.data;
  localStorage.setItem('access_token', access_token);
  localStorage.setItem('refresh_token', refresh_token);
  return user_data;
};

export const refresh = async (refreshToken: string) => {
  const response = await axiosInstance.post('/auth/refresh', { refresh_token: refreshToken });
  const { access_token } = response.data;
  localStorage.setItem('access_token', access_token);
  return access_token;
};