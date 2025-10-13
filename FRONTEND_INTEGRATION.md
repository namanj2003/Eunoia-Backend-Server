# Frontend Integration Guide

## Overview

This guide will help you integrate your Eunoia React frontend with the newly created backend server.

## Prerequisites

- Backend server running on `http://localhost:5000`
- MongoDB Atlas configured and connected
- User registered via API

---

## Step 1: Configure API Base URL

Create an API configuration file in your frontend:

**File:** `Eunoia Mental Health App/src/config/api.ts`

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  GET_PROFILE: `${API_BASE_URL}/auth/me`,
  UPDATE_PROFILE: `${API_BASE_URL}/auth/updateprofile`,
  CHANGE_PASSWORD: `${API_BASE_URL}/auth/changepassword`,
  
  // Journal endpoints
  JOURNAL: `${API_BASE_URL}/journal`,
  JOURNAL_BY_ID: (id: string) => `${API_BASE_URL}/journal/${id}`,
  JOURNAL_SEARCH: `${API_BASE_URL}/journal/search`,
  
  // Chat endpoints
  CHAT_SESSIONS: `${API_BASE_URL}/chat/sessions`,
  CHAT_SESSION_BY_ID: (sessionId: string) => `${API_BASE_URL}/chat/sessions/${sessionId}`,
  CHAT_MESSAGES: (sessionId: string) => `${API_BASE_URL}/chat/sessions/${sessionId}/messages`,
};

export default API_BASE_URL;
```

---

## Step 2: Create API Service Functions

**File:** `Eunoia Mental Health App/src/services/api.service.ts`

```typescript
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  register: async (name: string, email: string, password: string) => {
    const response = await api.post(API_ENDPOINTS.REGISTER, { name, email, password });
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post(API_ENDPOINTS.LOGIN, { email, password });
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getProfile: async () => {
    const response = await api.get(API_ENDPOINTS.GET_PROFILE);
    return response.data;
  },

  updateProfile: async (name: string, email: string) => {
    const response = await api.put(API_ENDPOINTS.UPDATE_PROFILE, { name, email });
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put(API_ENDPOINTS.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

// Journal Services
export const journalService = {
  getAllEntries: async (page = 1, limit = 10) => {
    const response = await api.get(API_ENDPOINTS.JOURNAL, {
      params: { page, limit },
    });
    return response.data;
  },

  getEntry: async (id: string) => {
    const response = await api.get(API_ENDPOINTS.JOURNAL_BY_ID(id));
    return response.data;
  },

  createEntry: async (entry: {
    title: string;
    content: string;
    mood?: string;
    tags?: string[];
    isPrivate?: boolean;
  }) => {
    const response = await api.post(API_ENDPOINTS.JOURNAL, entry);
    return response.data;
  },

  updateEntry: async (id: string, entry: {
    title?: string;
    content?: string;
    mood?: string;
    tags?: string[];
    isPrivate?: boolean;
  }) => {
    const response = await api.put(API_ENDPOINTS.JOURNAL_BY_ID(id), entry);
    return response.data;
  },

  deleteEntry: async (id: string) => {
    const response = await api.delete(API_ENDPOINTS.JOURNAL_BY_ID(id));
    return response.data;
  },

  searchEntries: async (query?: string, mood?: string, startDate?: string, endDate?: string) => {
    const response = await api.get(API_ENDPOINTS.JOURNAL_SEARCH, {
      params: { query, mood, startDate, endDate },
    });
    return response.data;
  },
};

// Chat Services
export const chatService = {
  getAllSessions: async () => {
    const response = await api.get(API_ENDPOINTS.CHAT_SESSIONS);
    return response.data;
  },

  createSession: async (title: string) => {
    const response = await api.post(API_ENDPOINTS.CHAT_SESSIONS, { title });
    return response.data;
  },

  getSession: async (sessionId: string) => {
    const response = await api.get(API_ENDPOINTS.CHAT_SESSION_BY_ID(sessionId));
    return response.data;
  },

  updateSession: async (sessionId: string, title: string) => {
    const response = await api.put(API_ENDPOINTS.CHAT_SESSION_BY_ID(sessionId), { title });
    return response.data;
  },

  deleteSession: async (sessionId: string) => {
    const response = await api.delete(API_ENDPOINTS.CHAT_SESSION_BY_ID(sessionId));
    return response.data;
  },

  getMessages: async (sessionId: string, limit = 50, before?: string) => {
    const response = await api.get(API_ENDPOINTS.CHAT_MESSAGES(sessionId), {
      params: { limit, before },
    });
    return response.data;
  },

  addMessage: async (sessionId: string, role: 'user' | 'assistant' | 'system', content: string) => {
    const response = await api.post(API_ENDPOINTS.CHAT_MESSAGES(sessionId), {
      role,
      content,
    });
    return response.data;
  },
};

export default api;
```

---

## Step 3: Update Login Screen

**File:** `Eunoia Mental Health App/src/components/LoginScreen.tsx`

Add these imports and functions:

```typescript
import { authService } from '../services/api.service';
import { useState } from 'react';

// In your component:
const [isLogin, setIsLogin] = useState(true); // true = login, false = register
const [formData, setFormData] = useState({
  name: '',
  email: '',
  password: '',
});
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    if (isLogin) {
      // Login
      await authService.login(formData.email, formData.password);
    } else {
      // Register
      await authService.register(formData.name, formData.email, formData.password);
    }
    
    // Navigate to home or dashboard
    window.location.href = '/home';
  } catch (err: any) {
    setError(err.response?.data?.message || 'An error occurred');
  } finally {
    setLoading(false);
  }
};
```

---

## Step 4: Update Journal Screen

**File:** `Eunoia Mental Health App/src/components/JournalScreen.tsx`

```typescript
import { journalService } from '../services/api.service';
import { useEffect, useState } from 'react';

interface JournalEntry {
  _id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  createdAt: string;
}

const JournalScreen = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const response = await journalService.getAllEntries();
      setEntries(response.data);
    } catch (error) {
      console.error('Failed to load entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async (title: string, content: string, mood: string) => {
    try {
      await journalService.createEntry({ title, content, mood });
      loadEntries(); // Reload entries
    } catch (error) {
      console.error('Failed to create entry:', error);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await journalService.deleteEntry(id);
      loadEntries(); // Reload entries
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  // Your UI code here...
};
```

---

## Step 5: Update Chat/Meditation Screen

**File:** `Eunoia Mental Health App/src/components/MeditationScreen.tsx` (or ChatScreen)

```typescript
import { chatService } from '../services/api.service';
import { useEffect, useState } from 'react';

interface Message {
  _id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

const ChatScreen = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      // Create new session or load existing
      const response = await chatService.createSession('New Chat');
      setSessionId(response.data.sessionId);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !sessionId) return;

    try {
      // Add user message
      await chatService.addMessage(sessionId, 'user', inputMessage);
      
      // TODO: Get AI response and add as assistant message
      // const aiResponse = await yourAIService.getResponse(inputMessage);
      // await chatService.addMessage(sessionId, 'assistant', aiResponse);

      // Reload messages
      const response = await chatService.getMessages(sessionId);
      setMessages(response.data);
      setInputMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Your UI code here...
};
```

---

## Step 6: Create Auth Context (Optional but Recommended)

**File:** `Eunoia Mental Health App/src/contexts/AuthContext.tsx`

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api.service';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setUser(response.data);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await authService.register(name, email, password);
    setUser(response.data);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## Step 7: Environment Variables

**File:** `Eunoia Mental Health App/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

**File:** `Eunoia Mental Health App/.env.production`

```env
VITE_API_URL=https://your-production-api.com/api
```

---

## Step 8: Testing

1. Start backend server:
   ```bash
   cd Eunoia-Backend-Server
   npm run dev
   ```

2. Start frontend:
   ```bash
   cd "Eunoia Mental Health App"
   npm run dev
   ```

3. Test flow:
   - Register a new user
   - Login
   - Create journal entry
   - View journal entries
   - Start chat session
   - Send messages

---

## Common Integration Issues

### CORS Errors
- Update `CLIENT_URL` in backend `.env` to match your frontend URL
- Default is `http://localhost:5173` for Vite

### 401 Unauthorized
- Check if token is being stored in localStorage
- Verify token is being sent in Authorization header
- Check if token has expired

### Network Errors
- Ensure backend is running on port 5000
- Check API_BASE_URL in frontend config
- Verify no firewall blocking connections

---

## Next Steps

1. ✅ Implement all service functions
2. ✅ Add loading states and error handling
3. ✅ Create protected routes
4. ✅ Add token refresh logic
5. 🔲 Integrate AI chatbot (OpenAI API)
6. 🔲 Add real-time features (Socket.io)
7. 🔲 Implement offline support
8. 🔲 Add analytics

---

## Additional Resources

- **Backend API Docs**: See `API_DOCUMENTATION.md`
- **Backend Setup**: See `SETUP_GUIDE.md`
- **Axios Docs**: https://axios-http.com/
- **React Query** (recommended): https://tanstack.com/query/

Good luck with your integration! 🚀
