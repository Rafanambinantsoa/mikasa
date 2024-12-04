import { toast } from "sonner";
import { create } from "zustand";
import axios from "../lib/axios";

// Task Store
export const useTaskStore = create((set, get) => ({
  tasks: [],
  loading: false,
  selectedTask: null,

  getTasks: async (force = false) => {
    const state = get();
    if (state.initialized && !force) {
      return state.tasks;
    }

    try {
      set({ loading: true });
      const response = await axios.get("/tache");
      const tasks = response.data || [];
      set({ tasks, initialized: true });
      return tasks;
    } catch (error) {
      toast.error("Error loading tasks");
      set({ error });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  reset: () => set({ tasks: [], initialized: false }),

  createTask: async (task) => {
    try {
      set({ loading: true });
      const response = await axios.post("/tache", task);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating task");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateTask: async (id, task) => {
    try {
      set({ loading: true });
      const response = await axios.put(`/tache/${id}`, task);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating task");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteTask: async (id) => {
    try {
      await axios.delete(`/tache/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting task");
      throw error;
    }
  },

  planTask: async (taskId, planData) => {
    try {
      set({ loading: true });

      // Ensure we're sending all required fields
      const taskUpdate = {
        ouvrage_id: planData.ouvrage_id,
        nom_tache: planData.nom_tache,
        description_tache: planData.description_tache || null,
        etat_tache: planData.etat_tache || "en attente",
        date_debut_prevue: planData.date_debut_prevue,
        date_fin_prevue: planData.date_fin_prevue,
        date_debut_reelle: planData.date_debut_reelle,
        date_fin_reelle: planData.date_fin_reelle,
      };

      // Update task in backend
      const response = await axios.put(`/tache/${taskId}`, taskUpdate);
      return true;
    } catch (error) {
      console.error("Error planning task:", error);
      toast.error(error.response?.data?.message || "Error planning task");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  executeTask: async (taskId, executionData) => {
    try {
      set({ loading: true });

      // Send all task data but update execution-specific fields
      const taskUpdate = {
        ouvrage_id: executionData.ouvrage_id,
        nom_tache: executionData.nom_tache,
        description_tache: executionData.description_tache || null,
        date_debut_prevue: executionData.date_debut_prevue,
        date_fin_prevue: executionData.date_fin_prevue,
        etat_tache: executionData.etat_tache,
        date_debut_reelle: executionData.date_debut_reelle,
        date_fin_reelle: executionData.date_fin_reelle,
      };

      // Update task in backend
      const response = await axios.put(`/tache/${taskId}`, taskUpdate);
      return true;
    } catch (error) {
      console.error("Error executing task:", error);
      toast.error(error.response?.data?.message || "Error updating task execution");
      return false;
    } finally {
      set({ loading: false });
    }
  },
}));
