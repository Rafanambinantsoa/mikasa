import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Select, Button, MultiSelect, Avatar } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useUserStore } from '../../stores/userStore';
import { toast } from 'sonner';
import { notifications } from '@mantine/notifications';
import { IconLoader2 } from '@tabler/icons-react';

const PlanningModal = ({ isOpen, onClose, workData, onPlan }) => {
    // Add debugging for initial workData
    useEffect(() => {
        console.log("workData received:", workData);
    }, [workData]);

    const {
        users = [],
        loading: usersLoading,
        getUsers
    } = useUserStore();

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([getUsers()]);
        };
        fetchData();
    }, []);

    const [selectedTask, setSelectedTask] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedWorkers, setSelectedWorkers] = useState([]);

    // Modified selectData with debugging
    const selectData = useMemo(() => {
        const data = workData.map(work => ({
            group: work.nom_ouvrage,
            items: work.taches?.map(task => ({
                value: task.id.toString(),
                label: task.nom_tache,
                task: task
            })) || []
        })).filter(group => group.items.length > 0);

        console.log("Generated selectData:", data);
        return data;
    }, [workData]);

    const availableWorkers = useMemo(() => {
        if (!selectedTask) return users;

        const taskId = parseInt(selectedTask);
        const filtered = users.filter(user =>
            !user.taches?.some(task =>
                task.id === taskId
            )
        );
        console.log("Available workers for task", taskId, ":", filtered);
        return filtered;
    }, [users, selectedTask]);

    const findSelectedTaskData = (taskId) => {
        console.log("Finding task with ID:", taskId);
        for (const work of workData) {
            if (!work.taches) {
                console.warn(`Work item ${work.nom_ouvrage} has no taches property`);
                continue;
            }
            const task = work.taches.find(task => task.id.toString() === taskId);
            if (task) {
                console.log("Found task:", task);
                return task;
            }
        }
        console.warn("No task found with ID:", taskId);
        return null;
    };

    useEffect(() => {
        if (selectedTask) {
            console.log("Selected task changed to:", selectedTask);
            const selectedTaskData = findSelectedTaskData(selectedTask);
            if (selectedTaskData) {
                const start = selectedTaskData.date_debut_prevue ?
                    new Date(selectedTaskData.date_debut_prevue + 'T08:00') : null;
                const end = selectedTaskData.date_fin_prevue ?
                    new Date(selectedTaskData.date_fin_prevue + 'T18:00') : null;

                console.log("Setting dates:", { start, end });
                setStartDate(start);
                setEndDate(end);
                setSelectedWorkers([]);
            }
        }
    }, [selectedTask, workData]);

    const generateWorkingHours = (start, end) => {
        const dates = [];
        const currentDate = new Date(start);
        const endDate = new Date(end);

        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const isFirstDay = currentDate.getTime() === start.getTime();
            const isLastDay = currentDate.getTime() === endDate.getTime();

            const formatTime = (date) => {
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                return `${hours}:${minutes}`;
            };

            dates.push({
                date_edt: dateStr,
                heure_debut: isFirstDay ? formatTime(start) : '08:00',
                heure_fin: isLastDay ? formatTime(end) : '18:00'
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;
    };

    const adjustToWorkingHours = (date) => {
        const adjustedDate = new Date(date);
        let hour = adjustedDate.getHours();

        // If hour is before 8:00, set to 8:00
        if (hour < 8) {
            adjustedDate.setHours(8, 0, 0, 0);
        }
        // If hour is after 18:00, set to 18:00
        else if (hour > 18) {
            adjustedDate.setHours(18, 0, 0, 0);
        }

        return adjustedDate;
    };

    const handleSubmit = async () => {
        console.log("Submit button clicked");

        // Validate required fields
        if (!selectedTask || !startDate || !endDate || selectedWorkers.length === 0) {
            console.log("Validation failed: missing required fields");
            toast.error('Veuillez remplir tous les champs requis');
            return;
        }

        // Adjust dates to working hours
        const adjustedStartDate = adjustToWorkingHours(startDate);
        const adjustedEndDate = adjustToWorkingHours(endDate);

        console.log("Adjusted dates:", {
            original: { startDate, endDate },
            adjusted: { adjustedStartDate, adjustedEndDate }
        });

        if (adjustedStartDate >= adjustedEndDate) {
            console.log("Validation failed: invalid date range");
            toast.error('La date de fin doit être postérieure à la date de début');
            return;
        }

        const selectedTaskData = findSelectedTaskData(selectedTask);
        if (!selectedTaskData) {
            console.log("Validation failed: task not found");
            toast.error('Tâche non trouvée');
            return;
        }

        // Generate working hours with adjusted dates
        const workingHours = generateWorkingHours(adjustedStartDate, adjustedEndDate);
        console.log("Generated working hours:", workingHours);

        const planData = {
            tache_id: parseInt(selectedTask),
            ...selectedTaskData,
            date_debut_prevue: adjustedStartDate.toISOString().split('T')[0],
            date_fin_prevue: adjustedEndDate.toISOString().split('T')[0],
            workers: selectedWorkers.map(id => parseInt(id)),
            workingHours,
            etat_tache: selectedTaskData.etat_tache || 'en attente'
        };

        console.log("Final planData being sent:", planData);

        // Show loading notification
        const loadingNotificationId = notifications.show({
            loading: true,
            title: 'Chargement',
            message: 'Veuillez patienter jusqu\'à ce que votre demande soit traitée',
            color: 'blue',
            autoClose: false,
            withCloseButton: false,
            icon: <IconLoader2 className="animate-spin" />
        });

        try {
            await onPlan(planData);
            notifications.hide(loadingNotificationId);
            onClose();
        } catch (error) {
            console.error("Error in handleSubmit:", error);
            notifications.hide(loadingNotificationId);
            toast.error('Erreur lors de la planification');
        }
    };


    return (
        <Modal
            opened={isOpen}
            onClose={onClose}
            title="Planifier une tâche"
            size="lg"
            styles={{
                title: {
                    fontSize: '1.2rem',
                    fontWeight: 600
                }
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Select
                    label="Sélectionnez une tâche"
                    placeholder="Choisir une tâche"
                    value={selectedTask}
                    onChange={(value) => {
                        console.log("Select onChange called with value:", value);
                        setSelectedTask(value);
                    }}
                    data={selectData}
                    searchable
                    required
                />

                <div style={{ display: 'flex', gap: '15px' }}>
                    <DateTimePicker
                        label="Date et heure de début"
                        placeholder="Sélectionner"
                        value={startDate}
                        onChange={setStartDate}
                        required
                        style={{ flex: 1 }}
                        minTime={new Date(0, 0, 0, 8, 0)}
                        maxTime={new Date(0, 0, 0, 18, 0)}
                    />
                    <DateTimePicker
                        label="Date et heure de fin"
                        placeholder="Sélectionner"
                        value={endDate}
                        onChange={setEndDate}
                        required
                        style={{ flex: 1 }}
                        minDate={startDate || undefined}
                        minTime={new Date(0, 0, 0, 8, 0)}
                        maxTime={new Date(0, 0, 0, 18, 0)}
                    />
                </div>

                <MultiSelect
                    label="Assigner des ouvriers"
                    placeholder="Sélectionner des ouvriers"
                    data={availableWorkers.map(member => ({
                        value: member.id.toString(),
                        label: `${member.firstname} ${member.name}`,
                        photo: member.photo
                    }))}
                    value={selectedWorkers}
                    onChange={setSelectedWorkers}
                    itemComponent={({ photo, label }) => (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Avatar src={photo} size="sm" />
                            <span>{label}</span>
                        </div>
                    )}
                    searchable
                    clearable
                />

                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '10px',
                    marginTop: '10px'
                }}>
                    <Button variant="subtle" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button onClick={handleSubmit}>
                        Planifier
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default PlanningModal;