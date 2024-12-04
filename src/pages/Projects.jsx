import { Button, Group, Image, Loader, ScrollArea, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import '../styles/projects/projects.css';

import ButtonComponent from '../components/ButtonComponent';
import FilterComponent from '../components/FilterComponent';
import ProjectCard from '../components/ProjectCard';
import TextInputComponent from '../components/TextInput';
import AddProject from '../components/modals/AddProject';

import { Add } from 'iconsax-react';
import { RefreshCw, SearchIcon } from 'lucide-react';
import noResultsImage from '../assets/images/no_results.webp';

// Only import required stores
import { useClientStore } from '../stores/clientStore';
import { useProjectStore } from '../stores/projectStore';
import { useTaskStore } from '../stores/taskStore';

const LoadingOverlay = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="loading-overlay"
    >
        <Loader size="xl" />
    </motion.div>
);

const EmptyState = ({ searchQuery, activeFilters, onReset }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="empty-state-container"
        style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '2rem'
        }}
    >
        <div className="not-found">
            <Image
                src={noResultsImage}
                alt="No results found"
                width={200}
                height={200}
                style={{ marginBottom: '1rem' }}
            />
        </div>

        <Text size="lg" weight={500} align="center" mb="xs">
            {searchQuery || activeFilters.length > 0
                ? 'Aucun projet ne correspond à vos critères'
                : 'Aucun projet trouvé'}
        </Text>
        <Text c="dimmed" size="sm" align="center" mb="md">
            {searchQuery || activeFilters.length > 0
                ? 'Essayez de modifier vos filtres ou votre recherche'
                : 'Commencez par ajouter votre premier projet'}
        </Text>
        {(searchQuery || activeFilters.length > 0) && (
            <Button
                variant="light"
                leftIcon={<RefreshCw size={16} />}
                onClick={onReset}
            >
                Réinitialiser les filtres
            </Button>
        )}
    </motion.div>
);

export default function Projects() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState([]);
    const [opened, { open, close }] = useDisclosure(false);
    const [error, setError] = useState(null);

    // Get initialized flags from all stores
    const {
        projects,
        getProjects,
        loading: projectsLoading,
        initialized: projectsInitialized
    } = useProjectStore();

    const {
        clients,
        getClients,
        loading: clientsLoading,
        initialized: clientsInitialized
    } = useClientStore();

    const {
        tasks,
        getTasks,
        loading: tasksLoading,
        initialized: tasksInitialized
    } = useTaskStore();

    const isLoading = projectsLoading || clientsLoading || tasksLoading;

    // Optimized data fetching that only runs when needed
    useEffect(() => {
        const fetchData = async () => {
            try {
                setError(null);
                await Promise.all([
                    getProjects(),
                    getClients(),
                    getTasks()
                ]);
                notifications.show({
                    title: 'Données chargées',
                    message: 'Les projets ont été chargés avec succès',
                    color: 'green',
                });
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error);
                notifications.show({
                    title: 'Erreur',
                    message: 'Impossible de charger les données des projets',
                    color: 'red',
                });
            }
        };
        fetchData();
    }, []);


    // Optimized retry handler that only refetches failed data
    const handleRetry = async () => {
        try {
            notifications.show({
                title: 'Rechargement',
                message: 'Tentative de rechargement des données...',
                loading: true,
                autoClose: false,
                withCloseButton: false,
                id: 'reload-notification'
            });

            const fetchPromises = [];
            if (!projectsInitialized) fetchPromises.push(getProjects());
            if (!clientsInitialized) fetchPromises.push(getClients());
            if (!tasksInitialized) fetchPromises.push(getTasks());

            await Promise.all(fetchPromises);

            setError(null);
            notifications.update({
                id: 'reload-notification',
                title: 'Succès',
                message: 'Les données ont été rechargées avec succès',
                color: 'green',
                loading: false,
                autoClose: 2000
            });
        } catch (error) {
            console.error('Error retrying data fetch:', error);
            notifications.update({
                id: 'reload-notification',
                title: 'Erreur',
                message: 'Impossible de recharger les données',
                color: 'red',
                loading: false,
                autoClose: 2000
            });
        }
    };

    // Rest of the component remains the same...
    const handleReset = useCallback(() => {
        setSearchQuery('');
        setActiveFilters([]);
    }, []);

    const getProjectTasks = useCallback(
        (project) => {
            const workIds = project.devis?.flatMap((quote) =>
                quote.ouvrages.map((work) => work.id)
            ) || [];
            return tasks?.filter((task) => workIds.includes(task.ouvrage_id)) || [];
        },
        [tasks] // Only recalculate when tasks change
    );

    const calculateProjectExpenses = useCallback(
        (project) => {
            const projectTasks = getProjectTasks(project);
            return projectTasks.reduce((total, task) => {
                const budget = task.budget_reel || {};
                return (
                    total +
                    (budget.mo || 0) +
                    (budget.materiaux || 0) +
                    (budget.materiels || 0) +
                    (budget.sous_traitance || 0)
                );
            }, 0);
        },
        [getProjectTasks] // Depends on memoized getProjectTasks
    );

    const handleSearchChange = useCallback((value) => {
        setSearchQuery(value);
    }, []);

    const handleFilterChange = useCallback((selectedFilters) => {
        setActiveFilters(selectedFilters);
    }, []);

    const filterCategoryData = useMemo(() => [
        {
            group: 'Phase de projet',
            items: projects ? [...new Set(projects.map(project => project.phase_projet))] : []
        },
        {
            group: 'Clients',
            items: clients ? clients.map(client => client.nom_client) : []
        }
    ], [projects, clients]);

    const normalizeText = (text) => {
        return text?.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase() || '';
    };

    const filteredProjects = useMemo(() => {
        if (!projects || !clients) return [];

        const normalizedSearchQuery = normalizeText(searchQuery);

        return projects.filter((project) => {
            const normalizedProjectName = normalizeText(project.nom_projet);
            const client = clients.find((c) => c.id === project.client_id);

            const matchesSearch = normalizedProjectName.includes(normalizedSearchQuery);
            const matchesFilters =
                activeFilters.length === 0 ||
                activeFilters.some(
                    (filter) =>
                        project.phase_projet === filter ||
                        (client && client.nom_client === filter)
                );

            return matchesSearch && matchesFilters;
        });
    }, [projects, clients, searchQuery, activeFilters]);

    const enrichedFilteredProjects = useMemo(() => {
        if (!filteredProjects || !clients) return [];

        return filteredProjects.map((project) => ({
            ...project,
            client: clients.find((client) => client.id === project.client_id),
            depenses: calculateProjectExpenses(project),
        }));
    }, [filteredProjects, clients, calculateProjectExpenses]);


    return (
        <div className="projects-container">
            <section className="main-title-section">
                <Group position="apart">
                    <div>
                        <h1 className="main-title">Projets</h1>
                        <h4 className="main-subtitle" c="dimmed">Liste des projets</h4>
                    </div>
                    {error && (
                        <Button
                            variant="light"
                            color="red"
                            leftIcon={<RefreshCw size={16} />}
                            onClick={handleRetry}
                        >
                            Réessayer
                        </Button>
                    )}
                </Group>
            </section>
            <div className="divider" />
            <section className="projects-action-section">
                <div className="projects-filter-section">
                    <TextInputComponent
                        fieldname="Rechercher"
                        rightIcon={<SearchIcon size={16} />}
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        disabled={isLoading}
                    />
                    <FilterComponent
                        filterCategory={filterCategoryData}
                        onChange={handleFilterChange}
                        value={activeFilters}
                        disabled={isLoading}
                    />
                </div>
                <div className="projects-add-section">
                    <ButtonComponent
                        fieldname="Ajouter"
                        rightIcon={<Add />}
                        onClick={open}
                        disabled={isLoading || error}
                    />
                </div>
            </section>
            <section className="projects-list-section">
                <section className="projects-card-list">
                    <ScrollArea className="projects-card-list-scrollarea">
                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                <LoadingOverlay key="loading" />
                            ) : error ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="error-container"
                                    style={{
                                        textAlign: 'center',
                                        padding: '2rem'
                                    }}
                                >
                                    <Text color="red" size="lg" weight={500} mb="md">
                                        Une erreur est survenue lors du chargement des projets
                                    </Text>
                                    <Button
                                        variant="light"
                                        color="red"
                                        leftIcon={<RefreshCw size={16} />}
                                        onClick={handleRetry}
                                    >
                                        Réessayer
                                    </Button>
                                </motion.div>
                            ) : enrichedFilteredProjects.length === 0 ? (
                                <EmptyState
                                    searchQuery={searchQuery}
                                    activeFilters={activeFilters}
                                    onReset={handleReset}
                                />
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="projects-grid"
                                >
                                    {enrichedFilteredProjects.map((projectItem, index) => (
                                        <motion.div
                                            key={projectItem.id}  // Use project ID instead of index
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ProjectCard
                                                project={projectItem}
                                                tasks={getProjectTasks(projectItem)}
                                            />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </ScrollArea>
                </section>
            </section>
            <AddProject
                opened={opened}
                onClose={close}
            />
        </div>
    );
}