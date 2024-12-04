import React, { createContext, useContext, useState } from 'react';
import axios from '../lib/axios';

// Create AuthContext
const AuthContext = createContext();

// Custom hook for using AuthContext
export const useAuth = () => useContext(AuthContext);
const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Login function
    const login = async (email, password) => {
        try {
            const response = await axios.post('/login', {
                email,
                password,
            });
            const { user, token } = response.data;
            // Save token securely, preferably in httpOnly cookie via backend
            localStorage.setItem('authToken', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            return true;
        } catch (error) {
            console.error('Login failed', error);
            // Instead of returning false, throw a user-friendly error
            if (error.response?.status === 401) {
                throw new Error('Email ou mot de passe incorrect');
                return false;
            } else if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
                return false;
            } else {
                throw new Error('Une erreur est survenue lors de la connexion');
                return false;
            }
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await axios.post('/logout');
            localStorage.removeItem('authToken');
            setUser(null);
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    // Check if the user is logged in (on page refresh)
    const checkAuth = async () => {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }
        try {
            const response = await axios.get('/me'); // Get authenticated user data
            setUser(response.data.user);
        } catch (error) {
            console.error('Authentication check failed', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        login,
        logout,
        checkAuth,
        loading,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;