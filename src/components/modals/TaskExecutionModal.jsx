import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Select, Button } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { CircleDot } from 'lucide-react';
import { toast } from 'sonner';

const ExecutionModal = ({ isOpen, onClose, workData, onExecute }) => {
    const [selectedTask, setSelectedTask] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('');

    // Modified to use taches directly from workData
    const selectData = useMemo(() => {
        return workData.map(work => ({
            group: work.nom_ouvrage,
            items: work.taches.map(task => ({
                value: task.id.toString(),
                label: task.nom_tache,
                task: task
            }))
        })).filter(group => group.items.length > 0);
    }, [workData]);

    const statusOptions = [
        { value: 'en attente', label: 'En attente', color: '#ff0000' },
        { value: 'en cours', label: 'En cours', color: '#ffd700' },
        { value: 'termine', label: 'Terminé', color: '#00ff00' }
    ];

    const findSelectedTaskData = (taskId) => {
        for (const work of workData) {
            const task = work.taches.find(task => task.id.toString() === taskId);
            if (task) return task;
        }
        return null;
    };

    useEffect(() => {
        if (selectedTask) {
            const selectedTaskData = findSelectedTaskData(selectedTask);
            if (selectedTaskData) {
                const start = selectedTaskData.date_debut_reelle ?
                    new Date(selectedTaskData.date_debut_reelle + 'T08:00') : null;
                const end = selectedTaskData.date_fin_reelle ?
                    new Date(selectedTaskData.date_fin_reelle + 'T18:00') : null;

                setStartDate(start);
                setEndDate(end);
                setSelectedStatus(selectedTaskData.etat_tache || 'en attente');
            }
        }
    }, [selectedTask, workData]);

    useEffect(() => {
        if (!isOpen) {
            setSelectedTask('');
            setStartDate(null);
            setEndDate(null);
            setSelectedStatus('');
        }
    }, [isOpen]);

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

    const handleSubmit = () => {
        if (!selectedTask || !startDate || !endDate || !selectedStatus) {
            toast.error('Veuillez remplir tous les champs requis');
            return;
        }

        const startHour = startDate.getHours();
        const endHour = endDate.getHours();
        const startMinutes = startDate.getMinutes();
        const endMinutes = endDate.getMinutes();

        if (startHour < 8 || (startHour === 8 && startMinutes < 0) ||
            startHour >= 18 || endHour < 8 || endHour > 18 ||
            (endHour === 18 && endMinutes > 0)) {
            toast.error('Les heures doivent être comprises entre 08:00 et 18:00');
            return;
        }

        if (startDate >= endDate) {
            toast.error('La date de fin doit être postérieure à la date de début');
            return;
        }

        const selectedTaskData = findSelectedTaskData(selectedTask);
        if (!selectedTaskData) {
            toast.error('Tâche non trouvée');
            return;
        }

        const workingHours = generateWorkingHours(startDate, endDate);

        // Include all existing task data and only update what we need
        const executionData = {
            ...selectedTaskData, // This will include ouvrage_id, nom_tache, and other required fields
            tache_id: parseInt(selectedTask),
            date_debut_reelle: startDate.toISOString().split('T')[0],
            date_fin_reelle: endDate.toISOString().split('T')[0],
            etat_tache: selectedStatus,
            workingHours
        };

        onExecute(executionData);
        onClose();
    };

    return (
        <Modal
            opened={isOpen}
            onClose={onClose}
            title="Renseigner l'avancement"
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
                    onChange={setSelectedTask}
                    data={selectData}
                    searchable
                    required
                />

                <div style={{ display: 'flex', gap: '15px' }}>
                    <DateTimePicker
                        label="Date et heure de début réelle"
                        placeholder="Sélectionner"
                        value={startDate}
                        onChange={setStartDate}
                        required
                        style={{ flex: 1 }}
                        minTime={new Date(0, 0, 0, 8, 0)}
                        maxTime={new Date(0, 0, 0, 18, 0)}
                    />
                    <DateTimePicker
                        label="Date et heure de fin réelle"
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

                <Select
                    label="État de la tâche"
                    placeholder="Sélectionner l'état"
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    data={statusOptions}
                    itemComponent={({ value, label, color }) => (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <CircleDot style={{ color }} size={16} />
                            <span>{label}</span>
                        </div>
                    )}
                    required
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
                        Valider
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ExecutionModal;