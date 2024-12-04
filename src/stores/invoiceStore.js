import { create } from 'zustand';
import axios from '../lib/axios';
import { toast } from 'sonner';

export const useInvoiceStore = create((set) => ({
    invoices: [],
    loading: false,
    error: null,

    // Get all invoices
    getInvoices: async () => {
        try {
            set({ loading: true });
            const response = await axios.get("/facture");
            const invoices = response.data.data || [];
            set({ invoices });
            return invoices;
        } catch (error) {
            toast.error(error.response?.data?.message || "Error loading invoices");
            set({ error });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    // Create invoice from devis
    createInvoice: async (devisId) => {
        try {
            set({ loading: true });
            const response = await axios.post("/facture", {
                devis_id: devisId
            });

            // Add the new invoice to the store
            set((state) => ({
                invoices: [...state.invoices, response.data.data]
            }));

            toast.success(response.data.message || "Invoice created successfully");
            return response.data.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Error creating invoice");
            set({ error });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    // Delete invoice
    deleteInvoice: async (invoiceId) => {
        try {
            set({ loading: true });
            await axios.delete(`/facture/${invoiceId}`);

            // Remove the deleted invoice from the store
            set((state) => ({
                invoices: state.invoices.filter(invoice => invoice.id !== invoiceId)
            }));

            toast.success("Invoice deleted successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Error deleting invoice");
            set({ error });
            throw error;
        } finally {
            set({ loading: false });
        }
    }
}));