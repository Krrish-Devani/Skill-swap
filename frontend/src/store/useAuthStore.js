import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isLoggingIn: false,
    isSigningUp: false,
    isCheckingAuth: true,
    isUpdatingProfile: false,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get('/auth/check-auth');
            set({ authUser: res.data });
        } catch (error) {
            console.log('Error checking auth:', error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (userData) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post('/auth/signup', userData);
            set({ authUser: res.data });
            toast.success('Signup successful!');
        } catch (error) {
            console.log('Error during signup:', error);
            toast.error(error.response?.data?.message || 'Signup failed');
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (userData) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post('/auth/login', userData);
            set({ authUser: res.data });
            toast.success('Login successful!');
        } catch (error) {
            console.log('Error during login:', error);
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post('/auth/logout');
            set({ authUser: null });
            toast.success('Logout successful!');
        } catch (error) {
            console.log('Error during logout:', error);
            toast.error(error.response?.data?.message || 'Logout failed');
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put('/users/me', data);
            set({ authUser: res.data.user });
            return res.data.user;
        } catch (error) {
            console.log('Error updating profile:', error);
            throw error;
        } finally {
            set({ isUpdatingProfile: false });
        }
    },
    
}))