import React from 'react';
import { ScrollArea } from '@mantine/core';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import '../styles/dashboard/pending_tasks_list.css';

// We no longer need ProjectStore since we have the project data
const PendingTasksList = ({ tasks = [], project = null }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short'
        });
    };

    const getStatusText = (status) => {
        const statusMap = {
            'en attente': 'En attente',
            'en cours': 'En cours',
            'termine': 'Terminée'
        };
        return statusMap[status] || status;
    };

    // Filter out completed tasks
    const pendingTasks = tasks.filter(task =>
        task.etat_tache === 'en cours' || task.etat_tache === 'en attente'
    );

    return (
        <ScrollArea.Autosize className="tasks-container">
            <div className="task-list">
                {pendingTasks.map((task) => (
                    <div key={task.id} className="task-card">
                        <div className="task-content">
                            <div className="task-header">
                                <h4 className="task-title">{task.nom_tache}</h4>
                            </div>

                            <div className="task-meta">
                                <span className="meta-item">
                                    <Clock size={16} />
                                    <span>{formatDate(task.date_fin_reelle)}</span>
                                </span>

                                <span className="meta-item">
                                    {task.etat_tache === 'en attente' ? (
                                        <AlertCircle size={16} className="status-delayed" />
                                    ) : (
                                        <CheckCircle2 size={16} className="status-pending" />
                                    )}
                                    <span>{getStatusText(task.etat_tache)}</span>
                                </span>

                                <span className="meta-separator">•</span>
                                <span className="project-name">{project?.nom_projet || 'Unknown Project'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea.Autosize>
    );
};

export default PendingTasksList;