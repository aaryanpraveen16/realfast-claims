import { useNavigate } from 'react-router-dom';
import { useAuthStore, UserPayload } from '../store/authSlice';

export const useAuth = () => {
  const navigate = useNavigate();
  const { token, user, setAuth, clearAuth } = useAuthStore();

  const getToken = () => token;
  const getUser = () => user;
  const isLoggedIn = () => !!token && !!user && user.exp * 1000 > Date.now();
  const getRole = () => user?.role;

  const logout = () => {
    clearAuth();
    navigate('/login');
  };

  const login = (newToken: string) => {
    setAuth(newToken);
  };

  return {
    getToken,
    getUser,
    isLoggedIn,
    getRole,
    logout,
    login,
    user,
    token,
  };
};
