import { toast } from "sonner";
import { create } from "zustand";
import axios from "../lib/axios";

// Job Store
export const useJobStore = create((set, get) => ({
  jobs: [],
  loading: false,
  selectedJob: null,

  getJobs: async () => {
    try {
      set({ loading: true });
      const response = await axios.get("/travail");
      set({ jobs: response.data });
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error loading jobs");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  createJob: async (job) => {
    try {
      set({ loading: true });
      const response = await axios.post("/travail", job);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating job");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateJob: async (id, job) => {
    try {
      set({ loading: true });
      const response = await axios.put(`/travail/${id}`, job);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating job");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteJob: async (id) => {
    try {
      await axios.delete(`/travail/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting job");
      throw error;
    }
  },
}));
