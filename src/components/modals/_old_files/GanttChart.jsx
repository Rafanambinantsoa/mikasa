import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Gantt, ViewMode } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";
import "../styles/projects/ganttchart.css"; // We'll create this style file next
import "../styles/projects/assign.css"
import { Modal, MultiSelect, Button, Avatar, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useData } from '../../../context/DataProvider';

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

// Task Assignment Modal Component
const TaskAssignmentModal = ({ isOpen, onClose, task, onAssign }) => {
    const { users, scheduleData, setScheduleData } = useData();
    const [selectedWorkers, setSelectedWorkers] = useState([]);

    const handleSubmit = () => {
        const newScheduleEntries = selectedWorkers.map(ouvrier_id => ({
            date_edt: task.date_debut_prevue,
            heure_debut: '08:00',  // Default start time
            heure_fin: '17:00',    // Default end time
            ouvrier_id,
            tache_id: task.id
        }));

        setScheduleData([...scheduleData, ...newScheduleEntries]);
        onAssign(selectedWorkers);
        onClose();
    };

    return (
        <Modal
            opened={isOpen}
            onClose={onClose}
            title={`Assigner un ouvrier à ${task?.nom_tache}`}
        >
            <div className="task-modal">
                <MultiSelect
                    data={users.map(member => ({
                        value: member.id.toString(),
                        label: `${member.firstname} ${member.name}`,
                        photo: member.photo
                    }))}
                    value={selectedWorkers}
                    onChange={setSelectedWorkers}
                    itemComponent={({ photo, label }) => (
                        <div className="select-item">
                            <Avatar src={photo} size="sm" className="select-item-avatar" />
                            <span>{label}</span>
                        </div>
                    )}
                    searchable
                    clearable
                    placeholder="Sélectionnez les ouvriers"
                />
                <div className="modal-actions">
                    <Button onClick={handleSubmit}>Assigner</Button>
                </div>
            </div>
        </Modal>
    );
};

const CustomTaskBar = ({
    task,
    children,
    assignedWorkers,
    ...props
}) => {
    return (
        <Tooltip
            label={
                <div className="tooltip-content">
                    <div>{task.name}</div>
                    {assignedWorkers?.length > 0 && (
                        <div className="assigned-workers-section">
                            <div>Ouvriers assignés:</div>
                            <div className="assigned-worker-list">
                                {assignedWorkers.map(worker => (
                                    <div key={worker.id} className="worker-item">
                                        <Avatar src={worker.photo} size="xs" className="avatar" />
                                        <span>{`${worker.firstname} ${worker.name}`}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            }
            position="top"
            withArrow
        >
            <div {...props} className="task-bar">
                <div className="task-bar-content">{children}</div>
                {assignedWorkers?.length > 0 && (
                    <div className="avatar-group">
                        {assignedWorkers.map(worker => (
                            <Avatar
                                key={worker.id}
                                src={worker.photo}
                                size="sm"
                                className="avatar avatar-stack"
                            />
                        ))}
                    </div>
                )}
            </div>
        </Tooltip>
    );
};

function isValidDate(date) {
    return date instanceof Date && !isNaN(date);
}

const GanttChart = ({ projectWorks, getWorkTasks }) => {
    const [view, setView] = useState(ViewMode.Month);
    const [isChecked, setIsChecked] = useState(true);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const ganttContainerRef = useRef(null);
    const [key, setKey] = useState(0);

    const [assignedWorkers, setAssignedWorkers] = useState({});
    const [selectedTask, setSelectedTask] = useState(null);
    const [opened, { open, close }] = useDisclosure(false);
    const { scheduleData, users } = useData();

    const getColumnWidth = () => {
        switch (view) {
            case ViewMode.Hour:
                return 150;
            case ViewMode.Year:
                return 310;
            case ViewMode.Month:
                return 250;
            case ViewMode.Week:
                return 200;
            case ViewMode.Day:
                return 165;
            default:
                return 250;
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

    const tasks = useMemo(() => {
        const result = [];

        projectWorks.forEach((work) => {
            const workTasks = getWorkTasks(work.id);

            // Calculate project start and end dates based on the tasks
            const dates = workTasks.reduce((acc, task) => {
                const taskStart = new Date(task.date_debut_prevue);
                const taskEnd = new Date(task.date_fin_prevue);

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

            // Add the project (work) task
            result.push({
                start: isValidDate(dates.start) ? dates.start : fallbackStart,
                end: isValidDate(dates.end) ? dates.end : fallbackEnd,
                name: work.nom_ouvrage,
                id: `work-${work.id}`,
                type: 'project',
                progress: 0,
                hideChildren: false
            });

            // Add each individual task within the project
            workTasks.forEach(task => {
                let progress = 0;
                if (task.etat_tache === "termine") {
                    progress = 100;
                } else if (task.date_debut_reelle) {
                    const today = new Date();
                    const start = new Date(task.date_debut_reelle);
                    const end = task.date_fin_reelle ? new Date(task.date_fin_reelle) : new Date(task.date_fin_prevue);
                    const total = end.getTime() - start.getTime();
                    const current = today.getTime() - start.getTime();
                    progress = Math.min(Math.max(Math.round((current / total) * 100), 0), 100);
                }

                // Add the planned task
                result.push({
                    start: new Date(task.date_debut_prevue),
                    end: new Date(task.date_fin_prevue),
                    name: task.nom_tache,
                    id: `task-${task.id}-${work.id}`,  // Modified to ensure unique key per work/task combination
                    type: 'task',
                    progress,
                    project: `work-${work.id}`,
                    styles: {
                        progressColor: task.etat_tache === "termine" ? '#BAD7F2' : '#E2E8F4',
                        progressSelectedColor: task.etat_tache === "termine" ? '#95B8E3' : '#C5D5E8',
                        backgroundColor: '#F8FAFF'
                    }
                });

                // Add the real task, if it exists
                if (task.date_debut_reelle) {
                    result.push({
                        start: new Date(task.date_debut_reelle),
                        end: new Date(task.date_fin_reelle || task.date_fin_prevue),
                        name: `${task.nom_tache} (Réel)`,
                        id: `task-${task.id}-${work.id}-real`,  // Modified to ensure unique key for real tasks
                        type: 'task',
                        progress: 100,
                        project: `work-${work.id}`,
                        dependencies: [`task-${task.id}-${work.id}`],
                        styles: {
                            progressColor: '#D4E4F7',
                            progressSelectedColor: '#A9C7E8'
                        }
                    });
                }
            });
        });

        return result;
    }, [projectWorks, getWorkTasks]);


    const handleTaskChange = (task) => {
        console.log("Task changed:", task.id);
    };

    const handleProgressChange = (task) => {
        console.log("Progress changed:", task.id);
    };

    const handleExpanderClick = (task) => {
        console.log("Expander clicked:", task.id);
    };

    const handleDoubleClick = (task) => {
        if (task.type === 'task') {
            setSelectedTask(task);
            open();
        }
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

    const renderCustomTaskBar = ({ task, ...props }) => {
        const taskWorkers = assignedWorkers[task.id] || [];

        return (
            <CustomTaskBar
                task={task}
                assignedWorkers={taskWorkers}
                {...props}
            >
                {task.name}
            </CustomTaskBar>
        );
    };


    return (
        <div className="gantt-wrapper">
            <div className="gantt-header">
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
                <Gantt
                    key={key}
                    tasks={tasks}
                    viewMode={view}
                    onDateChange={handleTaskChange}
                    onProgressChange={handleProgressChange}
                    onExpanderClick={handleExpanderClick}
                    onDoubleClick={handleDoubleClick}
                    TaskBarComponent={renderCustomTaskBar}
                    locale={frenchLocale}
                    columnWidth={getColumnWidth()}
                    listCellWidth={isChecked ? "160px" : ""}
                    rowHeight={40}
                    barCornerRadius={8}
                    todayColor="rgba(186, 215, 242, 0.2)"
                />
            </div>
            <TaskAssignmentModal
                isOpen={opened}
                onClose={close}
                task={selectedTask}
                onAssign={(workerIds) => handleAssign(selectedTask.id, workerIds)}
            />
        </div>
    );
};

export default GanttChart;