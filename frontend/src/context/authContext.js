import { createContext, useContext } from 'react';

const AuthContext = createContext({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  user: null,
  setUser: () => {}
});

export const useAuth = () => useContext(AuthContext);

export default AuthContext;