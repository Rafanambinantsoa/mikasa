import { toast } from "sonner";
import { create } from "zustand";
import axios from "../lib/axios";

// Quote Store
export const useQuoteStore = create((set) => ({
  quotes: [],
  loading: false,
  selectedQuote: null,

  getQuotes: async () => {
    try {
      set({ loading: true });
      const response = await axios.get("/devis");
      return response.data.data;
    } catch (error) {
      toast.error("Error loading quotes");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  createQuote: async (quoteData) => {
    try {
      set({ loading: true });
      const response = await axios.post("/devis", quoteData);
      return response.data.data;
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateQuote: async (id, quoteData) => {
    try {
      set({ loading: true });
      const response = await axios.put(`/devis/${id}`, quoteData);
      return response.data.data;
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteQuote: async (id) => {
    try {
      set({ loading: true });
      await axios.delete(`/devis/${id}`);
    } catch (error) {
      console.error("Erreur", error.response?.data);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateOuvrages: async (quoteId, ouvrages) => {
    try {
      set({ loading: true });
      const response = await axios.put(`/devis-ouvrage/${quoteId}`, ouvrages);
      return response.data;
    } catch (error) {
      console.error("Erreur", error.response?.data);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateProjectPhase: async (id, phase) => {
    try {
      set({ loading: true });
      const response = await axios.patch(`/projet/${id}`, {
        phase,
      });
      return response.data;
    } catch (error) {
      console.error("Erreur", error.response?.data);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  sendQuoteEmail: async (emailData) => {
    try {
      set({ loading: true });
      const response = await axios.post("/devis/send-email", emailData);
      return response.data;
    } catch (error) {
      toast.error("Erreur lors de l'envoi du devis");
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  // Add other quote-related methods as needed
}));
