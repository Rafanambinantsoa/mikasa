import { ActionIcon, Badge, Card, Menu, RingProgress, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Edit, MoreVertical } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/projects/projectcard.css';
import DetailsProject from './modals/DetailsProject';
import EditProject from './modals/EditProject';

const ProjectCard = ({ project }) => {
    const navigate = useNavigate();
    console.log("project : ", project)
    const [opened, { open, close }] = useDisclosure(false);
    const [detailsOpened, { open: detailsOpen, close: detailsClose }] = useDisclosure(false);

    // Memoize project tasks
    const projectTasks = useMemo(() => {
        return project.devis?.flatMap(devis =>
            devis.ouvrages?.flatMap(ouvrage => ouvrage.taches || [])
        ) || [];
    }, [project.devis]);

    // Memoize chiffre d'affaires calculation from validated devis
    const chiffreAffaires = useMemo(() => {
        return project.devis?.reduce((sum, devis) => {
            if (devis.etat_devis === 'validé') {
                return sum + parseFloat(devis.montant_total || 0);
            }
            return sum;
        }, 0) || 0;
    }, [project.devis]);

    // Memoize progress calculation
    const progress = useMemo(() => {
        const totalTasks = projectTasks.length;
        const completedTasks = projectTasks.filter(task => task.etat_tache === 'termine').length;
        return totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
    }, [projectTasks]);

    // Memoize expense calculation
    const totalExpenses = useMemo(() => {
        return projectTasks.reduce((sum, task) => {
            const budget = task.budget_reel || {};
            return sum +
                (budget.mo || 0) +
                (budget.materiaux || 0) +
                (budget.materiels || 0) +
                (budget.sous_traitance || 0);
        }, 0);
    }, [projectTasks]);

    // Memoized handlers
    const handleCardClick = useCallback(() => {
        navigate(`/projects/${project.id}`);
    }, [navigate, project.id]);

    const handleEditClick = useCallback((e) => {
        e.stopPropagation();
        open();
    }, [open]);

    const handleMenuClick = useCallback((e) => {
        e.stopPropagation();
        detailsOpen();
    }, [detailsOpen]);

    if (!project || !project.id) {
        console.log('Invalid project data:', project);
        return null;
    }

    // Create a memoized version of the project data
    const memoizedProjectData = useMemo(() => ({ ...project }), [project]);


    return (
        <>
            <Card className="project-card-list-item" onClick={handleCardClick} padding="xl" radius="xl" withBorder>
                <div className="project-card-header">
                    <div className="project-card-title-container">
                        <Text className="project-title">{project.nom_projet}</Text>
                        <Text size="sm" c="dimmed" mt={4}>
                            {project.client?.nom_client || 'Client non défini'}
                        </Text>
                    </div>
                    <div className="project-actions">
                        <ActionIcon variant="subtle" onClick={handleEditClick}>
                            <Edit size={18} />
                        </ActionIcon>
                        <Menu position="bottom-end">
                            <Menu.Target>
                                <ActionIcon variant="subtle" onClick={handleMenuClick}>
                                    <MoreVertical size={18} />
                                </ActionIcon>
                            </Menu.Target>
                        </Menu>
                    </div>
                </div>

                <div className="progress-section">
                    <Badge
                        className="phase-badge"
                        variant="filled"
                        color={project.phase_projet === 'realisation' ? 'green' :
                            project.phase_projet === 'devis' ? 'yellow' : 'blue'}
                    >
                        {project.phase_projet}
                    </Badge>
                    <RingProgress
                        size={64}
                        thickness={6}
                        roundCaps
                        sections={[{ value: progress, color: 'blue' }]}
                        label={
                            <Text c="blue" fw={700} ta="center" size="sm">
                                {progress}%
                            </Text>
                        }
                    />
                </div>

                <div className="financial-info">
                    <div className="info-item">
                        <Text size="sm" c="dimmed">Chiffre d'affaires</Text>
                        <Text>{chiffreAffaires.toLocaleString()} €</Text>
                    </div>
                    <div className="info-item">
                        <Text size="sm" c="dimmed">Dépenses</Text>
                        <Text>{totalExpenses.toLocaleString()} €</Text>
                    </div>
                </div>
            </Card>

            <EditProject opened={opened} onClose={close} projectData={memoizedProjectData} key={project.id} />
            <DetailsProject opened={detailsOpened} onClose={detailsClose} projectData={project} />
        </>
    );
};

export default ProjectCard;
