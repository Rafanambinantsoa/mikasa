import { toast } from "sonner";
import { create } from "zustand";
import axios from "../lib/axios";

// Client Store
export const useClientStore = create((set, get) => ({
  clients: [],
  loading: false,
  selectedClient: null,

  getClients: async (force = false) => {
    try {
      set({ loading: true });
      const response = await axios.get("/client");
      const clients = response.data.data || [];
      set({ clients, initialized: true });
      return clients;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error loading clients");
      set({ error });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  reset: () => set({ clients: [], initialized: false }),

  createClient: async (client) => {
    try {
      set({ loading: true });
      const response = await axios.post("/client", client);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating client");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateClient: async (id, client) => {
    try {
      set({ loading: true });
      const response = await axios.put(`/client/${id}`, client);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating client");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteClient: async (id) => {
    try {
      await axios.delete(`/client/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting client");
      throw error;
    }
  },
}));
