import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Gantt, ViewMode } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";
import "../../styles/projects/ganttchart.css";
import "../../styles/projects/assign.css"
import { Modal, MultiSelect, Button, Avatar, Tooltip, rem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useData } from '../../context/DataProvider';
import PlanningModal from '../modals/TaskPlanningModal';
import ExecutionModal from '../modals/TaskExecutionModal';
import { Calendar } from 'iconsax-react';


import { useUserStore } from '../../stores/userStore';
import { useScheduleStore } from '../../stores/scheduleStore';
import { useTaskStore } from '../../stores/taskStore';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';

const frenchLocale = {
    name: 'fr',
    weekdays: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    weekdaysShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    months: [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ],
    monthsShort: [
        'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
        'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
    ],
    today: "Aujourd'hui",
    now: 'Maintenant',
    am: 'AM',
    pm: 'PM'
};

function isValidDate(date) {
    return date instanceof Date && !isNaN(date);
}

// Base Gantt Chart Component
export const BaseGanttChart = ({
    projectWorks,
    getWorkTasks,
    showRealTasks = false,
    isPrevisionalEditable = true,
    title,
    onRefresh
}) => {
    const [view, setView] = useState(ViewMode.Week);
    const [isChecked, setIsChecked] = useState(true);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const ganttContainerRef = useRef(null);
    const [key, setKey] = useState(0);

    const [assignedWorkers, setAssignedWorkers] = useState({});
    const [selectedTask, setSelectedTask] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isPlanningModalOpen, { open: openPlanningModal, close: closePlanningModal }] = useDisclosure(false);
    // const { scheduleData, setScheduleData, users, taskData, setTaskData } = useData();
    const [isExecutionModalOpen, { open: openExecutionModal, close: closeExecutionModal }] = useDisclosure(false);

    const {
        users = [],
        loading: usersLoading,
        getUsers
    } = useUserStore();

    const {
        tasks = [],
        loading: tasksLoading,
        getTasks
    } = useTaskStore();

    const {
        schedules = [],
        loading: schedulesLoading,
        getWorkerTasks,
        getTaskWorkers
    } = useScheduleStore();

    // Fetch all required data on component mount
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                await Promise.all([
                    getUsers(),
                    getTasks(),
                    getWorkerTasks(),
                    getTaskWorkers()
                ]);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);


    const handlePlanTask = async (planData) => {
        console.log("handlePlanTask received:", planData);
        const { tache_id, workers, workingHours, ...taskData } = planData;

        try {
            console.log("Planning task with data:", {
                tache_id,
                taskData: {
                    ...taskData,
                    date_debut_prevue: planData.date_debut_prevue,
                    date_fin_prevue: planData.date_fin_prevue,
                    date_debut_reelle: planData.date_debut_prevue,
                    date_fin_reelle: planData.date_fin_prevue,
                    etat_tache: planData.etat_tache || 'en attente'
                }
            });

            // First plan the task with new dates
            const taskPlanned = await useTaskStore.getState().planTask(tache_id, {
                ...taskData,
                date_debut_prevue: planData.date_debut_prevue,
                date_fin_prevue: planData.date_fin_prevue,
                date_debut_reelle: planData.date_debut_prevue,
                date_fin_reelle: planData.date_fin_prevue,
                etat_tache: planData.etat_tache || 'en attente'
            });

            if (!taskPlanned) {
                console.error("Task planning failed");
                throw new Error('Failed to plan task');
            }

            console.log("Task planned successfully, assigning workers...");

            // Then assign workers with the generated working hours
            const workersAssigned = await useScheduleStore.getState().assignWorkersToTask(
                tache_id,
                workers,
                workingHours
            );

            if (!workersAssigned) {
                console.error("Worker assignment failed");
                throw new Error('Failed to assign workers');
            }

            console.log("Workers assigned successfully, refreshing data...");

            // Refresh data
            await Promise.all([
                getTasks(),
                getWorkerTasks(),
                getTaskWorkers()
            ]);

            await onRefresh();

            setKey(prev => prev + 1);

            notifications.show({
                title: 'Succès',
                message: 'Tâche planifiée avec succès!',
                color: 'teal',
                icon: <IconCheck style={{ width: rem(20), height: rem(20) }} />,
                autoClose: 5000,
            });

        } catch (error) {
            console.error('Error planning task:', error);
            notifications.show({
                title: 'Erreur',
                message: error.message || 'Il y a eu un problème lors de la planification',
                color: 'red'
            });
            throw error; // Re-throw to allow proper error handling in the modal
        }
    };

    const handleExecuteTask = async (executionData) => {
        const { tache_id, ...taskData } = executionData;

        try {
            const taskExecuted = await useTaskStore.getState().executeTask(tache_id, taskData);

            if (!taskExecuted) {
                throw new Error('Failed to update task execution');
            }

            // Refresh data
            await getTasks();
            await onRefresh();
            setKey(prev => prev + 1);

            notifications.show({
                title: 'Succès',
                message: 'Avancement de la tâche mis à jour avec succès!',
                color: 'teal',
                icon: <IconCheck style={{ width: rem(20), height: rem(20) }} />,
                autoClose: 5000,
            });

        } catch (error) {
            console.error('Error executing task:', error);
            notifications.show({
                title: 'Erreur',
                message: error.message || "Il y a eu un problème lors de la mise à jour",
                color: 'red'
            });
        }
    };

    const getColumnWidth = () => {
        switch (view) {
            case ViewMode.Hour: return 150;
            case ViewMode.Year: return 310;
            case ViewMode.Month: return 250;
            case ViewMode.Week: return 200;
            case ViewMode.Day: return 80;
            default: return 250;
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            setKey(prev => prev + 1);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getTaskProgress = (task) => {
        switch (task.etat_tache) {
            case 'en attente':
                return 0;
            case 'en cours':
                // Calculate progress based on time elapsed if the task has started
                if (task.date_debut_reelle) {
                    const today = new Date();
                    const start = new Date(task.date_debut_reelle);
                    const end = task.date_fin_reelle
                        ? new Date(task.date_fin_reelle)
                        : new Date(task.date_fin_prevue);

                    // If task is overdue, cap progress at 90%
                    if (today > end) {
                        return 90;
                    }

                    const total = end.getTime() - start.getTime();
                    const current = today.getTime() - start.getTime();
                    // Progress between 25% and 90% for tasks in progress
                    return Math.min(Math.max(Math.round((current / total) * 100), 25), 90);
                }
                // If task is marked as in progress but hasn't started yet
                return 25;
            case 'termine':
                return 100;
            default:
                return 0;
        }
    };

    const tasksItems = useMemo(() => {
        const result = [];

        projectWorks.forEach((work) => {
            const workTasks = getWorkTasks(work.id);

            // Calculate project dates
            const dates = workTasks.reduce((acc, task) => {
                const taskStart = new Date(task.date_debut_prevue);
                const taskEnd = new Date(task.date_fin_prevue);

                if (showRealTasks && task.date_debut_reelle) {
                    const realStart = new Date(task.date_debut_reelle);
                    const realEnd = new Date(task.date_fin_reelle || task.date_fin_prevue);
                    if (realStart < acc.start || !acc.start) acc.start = realStart;
                    if (realEnd > acc.end || !acc.end) acc.end = realEnd;
                }

                if (isValidDate(taskStart) && (!acc.start || taskStart < acc.start)) {
                    acc.start = taskStart;
                }
                if (isValidDate(taskEnd) && (!acc.end || taskEnd > acc.end)) {
                    acc.end = taskEnd;
                }

                return acc;
            }, { start: null, end: null });

            const fallbackStart = new Date();
            const fallbackEnd = new Date(fallbackStart);
            fallbackEnd.setDate(fallbackEnd.getDate() + 1);

            // Add project task
            result.push({
                start: isValidDate(dates.start) ? dates.start : fallbackStart,
                end: isValidDate(dates.end) ? dates.end : fallbackEnd,
                name: work.nom_ouvrage,
                id: `work-${work.id}`,
                type: 'project',
                progress: 0,
                hideChildren: false
            });

            // Add tasks for this work
            workTasks.forEach(task => {
                const progress = getTaskProgress(task);

                // Add planned task
                const plannedTask = {
                    start: new Date(task.date_debut_prevue),
                    end: new Date(task.date_fin_prevue),
                    name: task.nom_tache,
                    id: `task-${task.id}-${work.id}`,
                    type: 'task',
                    progress,
                    project: `work-${work.id}`,
                    styles: {
                        progressColor: task.etat_tache === "termine"
                            ? '#228be6'
                            : task.etat_tache === "en cours"
                                ? '#37b24d'
                                : '#1971c2',
                        progressSelectedColor: task.etat_tache === "termine"
                            ? '#1c7ed6'
                            : task.etat_tache === "en cours"
                                ? '#2f9e44'
                                : '#1864ab',
                        backgroundColor: showRealTasks ? '#228be6' : '#1971c2',
                        cursor: isPrevisionalEditable ? 'pointer' : 'default'
                    },
                    isDisabled: !isPrevisionalEditable
                };
                result.push(plannedTask);

                // Add real task if needed and exists
                if (showRealTasks && task.date_debut_reelle) {
                    result.push({
                        start: new Date(task.date_debut_reelle),
                        end: new Date(task.date_fin_reelle || task.date_fin_prevue),
                        name: `${task.nom_tache} (Réel)`,
                        id: `task-${task.id}-${work.id}-real`,
                        type: 'task',
                        progress: 100,
                        project: `work-${work.id}`,
                        dependencies: [`task-${task.id}-${work.id}`],
                        styles: {
                            progressColor: '#228be6',
                            progressSelectedColor: '#1971c2',
                            backgroundColor: '#1864ab'
                        }
                    });
                }
            });
        });

        return result;
    }, [projectWorks, getWorkTasks, showRealTasks]);

    const handleTaskChange = (task) => {
        if (!isPrevisionalEditable) return;
        console.log("Task changed:", task.id);
    };

    const handleProgressChange = (task) => {
        if (!isPrevisionalEditable) return;
        console.log("Progress changed:", task.id);
    };

    const handleExpanderClick = (task) => {
        console.log("Expander clicked:", task.id);
    };

    const handleDoubleClick = (task) => {
        console.log('clicked!')
    };

    const handleAssign = (tache_id, workerIds) => {
        const workers = users.filter(member =>
            workerIds.includes(member.id.toString())
        );
        setAssignedWorkers(prev => ({
            ...prev,
            [tache_id]: workers
        }));
    };


    return (
        <div className="gantt-wrapper">
            <div className="gantt-header">
                <div className="gantt-title">
                    {isPrevisionalEditable &&
                        <Button
                            onClick={openPlanningModal}
                            variant='default'
                            radius='md'
                        >Planifier</Button>
                    }
                    {!isPrevisionalEditable &&
                        <Button
                            onClick={openExecutionModal}
                            variant='default'
                            radius='md'
                        >Renseigner avancement</Button>
                    }
                </div>

                <div className="gantt-controls">
                    <select
                        className="view-selector"
                        value={view}
                        onChange={(e) => setView(e.target.value)}
                    >
                        <option value={ViewMode.Day}>Journée</option>
                        <option value={ViewMode.Week}>Semaine</option>
                        <option value={ViewMode.Month}>Mois</option>
                        <option value={ViewMode.Year}>Année</option>
                    </select>
                    <label className="list-toggle">
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => setIsChecked(e.target.checked)}
                        />
                        <span className="checkbox-custom"></span>
                        <span className="label-text">Afficher la liste</span>
                    </label>
                </div>
            </div>
            <div className="gantt-container" ref={ganttContainerRef}>
                {tasksItems.length > 0 ? (
                    <Gantt
                        key={key}
                        tasks={tasksItems}
                        viewMode={view}
                        locale="fr"
                        listCellWidth={isChecked ? "160px" : ""}
                        rowHeight={40}
                        barCornerRadius={8}
                        todayColor="rgba(186, 215, 242, 0.2)"
                    />
                ) : (<Gantt
                    key={key}
                    tasks={tasksItems}
                    viewMode={view}
                    onDateChange={handleTaskChange}
                    onProgressChange={handleProgressChange}
                    onExpanderClick={handleExpanderClick}
                    onDoubleClick={handleDoubleClick}
                    locale={frenchLocale}
                    columnWidth={getColumnWidth()}
                    listCellWidth={isChecked ? "160px" : ""}
                    rowHeight={40}
                    barCornerRadius={8}
                    todayColor="rgba(186, 215, 242, 0.2)"
                />)}
            </div>
            {isPrevisionalEditable && <PlanningModal
                isOpen={isPlanningModalOpen}
                onClose={closePlanningModal}
                workData={projectWorks}
                onPlan={handlePlanTask}
            />}
            {!isPrevisionalEditable && <ExecutionModal
                isOpen={isExecutionModalOpen}
                onClose={closeExecutionModal}
                workData={projectWorks}
                onExecute={handleExecuteTask}
            />}
        </div>
    );
};