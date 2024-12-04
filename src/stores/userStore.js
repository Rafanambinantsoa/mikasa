import { toast } from "sonner";
import { create } from "zustand";
import axios from "../lib/axios";

// User Store
export const useUserStore = create((set) => ({
  users: [],
  loading: false,
  selectedUser: null, // To store selected user's tasks

  getUsers: async () => {
    try {
      set({ loading: true });
      const response = await axios.get("/ouvrier");
      const users = response.data.data;
      set({ users });
      return users; // Return the updated users
    } catch (error) {
      toast.error("Error loading users");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // New function to get a single user (with his tasks)
  getUser: async (userId) => {
    try {
      set({ loading: true });
      const response = await axios.get(`/ouvrier/${userId}`);
      const selectedUser = response.data.data;
      set({ selectedUser }); // Set selectedUser with tasks
      return selectedUser; // Return selected user's tasks
    } catch (error) {
      toast.error("Error loading user tasks");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateUser: async (id, user) => {
    try {
      set({ loading: true });
      const response = await axios.post(`/ouvrier/${id}`, user, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      toast.error("Error updating user");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  createUser: async (user) => {
    try {
      set({ loading: true });
      const response = await axios.post("/ouvrier", user, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      toast.error("Error creating user");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteUser: async (id) => {
    try {
      await axios.delete(`/ouvrier/${id}`);
    } catch (error) {
      toast.error("Error deleting user");
      throw error;
    }
  },
}));
