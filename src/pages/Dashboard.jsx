import { Avatar, Card, Progress, Text } from '@mantine/core';
import React, { useEffect, useMemo } from 'react';
import ChartCard from '../components/ChartCard';
import PendingTasksList from '../components/PendingTaskList';
import QuoteCard from '../components/QuoteCard';
import { useProjectStore } from '../stores/projectStore';
import { useWorkStore } from '../stores/workStore';
import '../styles/dashboard/dashboard.css';
import '../styles/dashboard/dashboard_calendar.css';

export default function Dashboard() {
    const {
        getProjects,
        getProject,
        getLatestRealizationProject,
        loading,
        selectedProject: latestProject,
        initialized
    } = useProjectStore();

    const { getWork } = useWorkStore();

    // Initial data fetch
    useEffect(() => {
        const initializeDashboard = async () => {
            try {
                await getProjects();
                const latestProject = getLatestRealizationProject();
                if (latestProject) {
                    await getProject(latestProject.id);
                }
            } catch (error) {
                console.error('Dashboard initialization error:', error);
            }
        };

        if (!initialized) {
            initializeDashboard();
        }
    }, [initialized]);

    // Memoized tasks extraction from latest project
    const projectTasks = useMemo(() => {
        if (!latestProject?.devis) return [];
        return latestProject.devis
            .flatMap(devis => devis.ouvrages || [])
            .flatMap(ouvrage => ouvrage.taches || []);
    }, [latestProject]);

    // Memoized budget calculations
    const projectBudgets = useMemo(() => {
        return projectTasks.reduce((acc, task) => {
            Object.keys(acc.previsionnel).forEach(key => {
                acc.previsionnel[key] += task.budget_previsionnel[key] || 0;
                acc.reel[key] += task.budget_reel[key] || 0;
            });
            return acc;
        }, {
            previsionnel: { mo: 0, materiaux: 0, materiels: 0, sous_traitance: 0 },
            reel: { mo: 0, materiaux: 0, materiels: 0, sous_traitance: 0 }
        });
    }, [projectTasks]);

    // Memoized task progress calculations
    const { completedTasks, totalTasks, progressValue } = useMemo(() => {
        const completed = projectTasks.filter(task => task.etat_tache === 'termine').length;
        const total = projectTasks.length;
        return {
            completedTasks: completed,
            totalTasks: total,
            progressValue: total ? (completed / total) * 100 : 0
        };
    }, [projectTasks]);

    return (
        <div className="dashboard-container">
            {/* Rest of the JSX remains the same, just replace isLoading with loading from store */}
            <section className="main-title-section">
                <h1 className="main-title">Tableau de bord</h1>
                <Text className="main-subtitle" c="dimmed">Bienvenue 👋 !</Text>
            </section>

            <section className="bento-grid">
                <Card className="bento-item top-left" shadow="sm" padding="lg" withBorder>
                    <div className="project-card-container">
                        <Text className="main-subtitle" size='sm' c="dimmed">Projet en cours</Text>
                        <div className="project-card">
                            <div className="project-info">
                                <div className="project-title">
                                    <Text className="main-title" size='xl' weight={700} mt='sm'>
                                        {loading ? 'Chargement...' : (latestProject?.nom_projet || 'Aucun projet en cours')}
                                    </Text>
                                </div>
                                <Avatar.Group>
                                    {loading ? (
                                        <Avatar size={32}>...</Avatar>
                                    ) : (
                                        <>
                                            {projectTasks.slice(0, 3).map((task) => (
                                                <Avatar
                                                    key={task.id}
                                                    src={task.photo}
                                                    size={32}
                                                    alt={task.nom_tache}
                                                />
                                            ))}
                                            {projectTasks.length > 3 && (
                                                <Avatar size={32}>+{projectTasks.length - 3}</Avatar>
                                            )}
                                        </>
                                    )}
                                </Avatar.Group>
                            </div>
                            <div className="project-progress">
                                <Text size='md'>
                                    Tâches terminées : <span className='bold-title'>
                                        {loading ? 'Chargement...' : completedTasks}
                                    </span>
                                    {!loading && `/${totalTasks}`}
                                </Text>
                                <Progress
                                    size="xl"
                                    radius="xl"
                                    mt="lg"
                                    value={loading ? 0 : progressValue}
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="bento-item top-right" shadow="sm" padding="lg" withBorder>
                    <div className="project-card-container">
                        <Text className="main-subtitle" size='sm' c="dimmed">Tâches en attente</Text>
                        <div className="project-card">
                            <div className="pending-tasks-list">
                                {loading ? (
                                    <Text>Chargement...</Text>
                                ) : (
                                    <PendingTasksList tasks={projectTasks} project={latestProject} />
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="bento-item bottom-left" shadow="sm" padding="lg" withBorder>
                    <div className="project-card-container">
                        <div className="project-card">
                            <div className="project-title">
                                <Text className="main-title" size='xl' weight={700} mt='sm'>Devis</Text>
                            </div>
                            {loading ? (
                                <Text>Chargement...</Text>
                            ) : (
                                <QuoteCard project={latestProject} />
                            )}
                        </div>
                    </div>
                </Card>

                <Card className="bento-item bottom-right" shadow="sm" padding="lg" withBorder>
                    <div className="project-card-container">
                        <div className="project-card">
                            <div className="project-title">
                                <Text className="main-title" size='xl' weight={700} mt='sm'>Statistiques</Text>
                                <Text size='sm' weight={500} mb='md' c='dimmed'>Comparaison des budgets</Text>
                            </div>
                            {loading ? (
                                <Text>Chargement...</Text>
                            ) : (
                                <ChartCard budgetData={projectBudgets} />
                            )}
                        </div>
                    </div>
                </Card>
            </section>
        </div>
    );
};

