import axios from "../lib/axios";
import { toast } from "sonner";
import { create } from "zustand";

import { useUserStore } from "./userStore";
import { useTaskStore } from "./taskStore";

// Schedule Store
export const useScheduleStore = create((set, get) => ({
    schedules: [],
    loading: false,

    getTaskWorkers: (tache_id) => {
        const state = useUserStore.getState();
        const schedules = get().schedules;  // Get current schedules from store

        return state.users.filter(worker =>
            schedules.some(schedule =>
                schedule.tache_id === tache_id && schedule.ouvrier_id === worker.id
            )
        );
    },

    getWorkerTasks: (ouvrier_id) => {
        const state = useTaskStore.getState();
        const schedules = get().schedules;  // Get current schedules from store

        return state.tasks.filter(task =>
            schedules.some(schedule =>
                schedule.ouvrier_id === ouvrier_id && schedule.tache_id === task.id
            )
        );
    },

    assignWorkersToTask: async (tache_id, workerIds, workingHours) => {
        try {
            set({ loading: true });

            // Create assignments for each worker and each working day
            const assignments = [];

            for (const workerId of workerIds) {
                for (const { date_edt, heure_debut, heure_fin } of workingHours) {
                    try {
                        const assignmentData = {
                            user_id: workerId,
                            date_edt,
                            heure_debut,
                            heure_fin
                        };

                        const response = await axios.post(`/tache/${tache_id}/assign-user`, assignmentData);
                        assignments.push(response.data.data);
                    } catch (error) {
                        // If it's a validation error (HTTP 422), check if it's a duplicate assignment
                        if (error.response?.status === 422) {
                            console.warn(`Worker ${workerId} already assigned for ${date_edt}`);
                            continue; // Skip this assignment and continue with others
                        }
                        throw error;
                    }
                }
            }

            if (assignments.length > 0) {
                set(state => ({
                    schedules: [...state.schedules, ...assignments]
                }));
            }

            return true;
        } catch (error) {
            console.error('Error assigning workers:', error);
            toast.error(error.response?.data?.message || "Error assigning workers to task");
            return false;
        } finally {
            set({ loading: false });
        }
    },

    removeAssignments: (tache_id, workerIds = null) => {
        set(state => ({
            schedules: state.schedules.filter(schedule => {
                if (schedule.tache_id !== tache_id) return true;
                if (workerIds === null) return false;
                return !workerIds.includes(schedule.ouvrier_id);
            })
        }));
    }
}));