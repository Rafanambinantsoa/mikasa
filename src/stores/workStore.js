import { toast } from "sonner";
import { create } from "zustand";
import axios from "../lib/axios";

export const useWorkStore = create((set) => ({
  works: [],
  loading: false,
  selectedWork: null,

  getWorks: async () => {
    try {
      set({ loading: true });
      const response = await axios.get("/ouvrage");
      set({ works: response.data });
      return response.data;
    } catch (error) {
      toast.error("Error loading works");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getWork: async (id) => {
    try {
      if (!id) {
        console.error("getWork called with undefined id!");
        throw new Error("Work ID is required");
      }
      set({ loading: true });
      const response = await axios.get(`/ouvrage/${id}`);
      return response.data;
    } catch (error) {
      toast.error("Error loading work");
      console.error("Failed to fetch work:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  createWork: async (work) => {
    try {
      set({ loading: true });
      const response = await axios.post("/ouvrage", work);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating work");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateWork: async (id, work) => {
    try {
      set({ loading: true });
      const response = await axios.put(`/ouvrage/${id}`, work);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating work");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteWork: async (id) => {
    try {
      await axios.delete(`/ouvrage/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting work");
      throw error;
    }
  },
}));
