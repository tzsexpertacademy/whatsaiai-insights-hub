
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  plan: 'basic' | 'premium' | 'enterprise';
  createdAt: Date;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock de usuários para demonstração
const mockUsers: User[] = [
  {
    id: '1',
    email: 'demo@cliente.com',
    name: 'Cliente Demonstração',
    plan: 'premium',
    createdAt: new Date('2024-01-15'),
    isActive: true
  },
  {
    id: '2',
    email: 'test@empresa.com',
    name: 'Empresa Teste',
    plan: 'enterprise',
    createdAt: new Date('2024-01-10'),
    isActive: true
  }
];

// Função auxiliar para preservar as datas durante serialização/deserialização
const parseUserWithDates = (userData: any): User => {
  if (!userData) return userData;
  
  return {
    ...userData,
    createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date()
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há um usuário logado no localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        // Converter o savedUser em objeto e garantir que createdAt seja um Date
        const parsedUser = parseUserWithDates(JSON.parse(savedUser));
        setUser(parsedUser);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    // Simular API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email);
    
    if (!foundUser || password !== 'senha123') {
      throw new Error('Credenciais inválidas');
    }

    if (!foundUser.isActive) {
      throw new Error('Conta inativa. Entre em contato com o suporte.');
    }

    setUser(foundUser);
    localStorage.setItem('user', JSON.stringify(foundUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
