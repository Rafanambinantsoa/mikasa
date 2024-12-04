import { create } from "zustand";
import axios from "../lib/axios";

export const useProjectStore = create((set, get) => ({
  projects: [],
  loading: false,
  selectedProject: null,
  error: null,
  initialized: false,

  createProject: async (project) => {
    try {
      set({ loading: true });
      const response = await axios.post("/projet", project);
      return response.data;
    } catch (error) {
      console.error("Erreur", error.response?.data);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateProject: async (id, project) => {
    try {
      set({ loading: true });
      const response = await axios.put(`/projet/${id}`, project);
      return response.data;
    } catch (error) {
      console.error("Erreur", error.response?.data);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteProject: async (id) => {
    try {
      set({ loading: true });
      await axios.delete(`/projet/${id}`);
    } catch (error) {
      console.error("Erreur", error.response?.data);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getProjects: async () => {
    try {
      set({ loading: true });
      const response = await axios.get("/projet");
      const projects = response.data || [];
      set({ projects, initialized: true });
      return projects;
    } catch (error) {
      console.error("Erreur", error.response?.data);
      set({ error });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  reset: () => set({ projects: [], initialized: false, error: null }),

  getProject: async (id) => {
    try {
      set({ loading: true });
      const response = await axios.get(`/projet/${id}`);
      const projectData = response.data.data;
      set({ selectedProject: projectData });
      return projectData;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Helper method to get latest project in realization phase
  getLatestRealizationProject: () => {
    const state = get();
    const realizationProjects = state.projects.filter(
      (p) => p.phase_projet === "realisation"
    );

    // Find the project with the maximum ID
    return realizationProjects.length > 0
      ? realizationProjects.reduce((latest, current) =>
          current.id > latest.id ? current : latest
        )
      : null;
  },
}));
