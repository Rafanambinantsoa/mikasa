import { toast } from "sonner";
import { create } from "zustand";
import axios from "../lib/axios";

// Budget Store
export const useBudgetStore = create((set) => ({
  budgets: [],
  loading: false,
  selectedBudget: null,

  getBudgets: async () => {
    try {
      set({ loading: true });
      const response = await axios.get("/budget");
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error loading budgets");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  createBudget: async (budget) => {
    try {
      set({ loading: true });
      const response = await axios.post("/budget", budget);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating budget");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateBudget: async (id, budget) => {
    try {
      set({ loading: true });
      const response = await axios.put(`/budget/${id}`, budget);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating budget");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteBudget: async (id) => {
    try {
      await axios.delete(`/budget/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting budget");
      throw error;
    }
  },
}));
