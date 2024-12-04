import { Breadcrumbs, Loader, Tabs } from '@mantine/core';
import React, { useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../styles/projects/projectpage.css';

import ExecPage from './ExecPage';
import PrepPage from './PrepPage';
import QuoteList from './QuoteList';

import { Calendar, Receipt1, Timer } from 'iconsax-react';
import { useProjectStore } from '../stores/projectStore';

export default function ProjectPage() {
    const { id } = useParams();
    console.log("Project id : ", id)
    const {
        getProject,
        selectedProject: project,
        loading,
        error,
    } = useProjectStore();

    const refreshProject = useCallback(async () => {
        if (!id) return;
        try {
            await getProject(id);
        } catch (error) {
            console.error("Error refreshing project:", error);
        }
    }, [id, getProject]);

    useEffect(() => {
        refreshProject();
    }, [refreshProject]);

    useEffect(() => {
        const loadProject = async () => {
            if (!id) return;
            try {
                await getProject(id);
            } catch (error) {
                console.error("Error fetching project:", error);
            }
        };
        loadProject();
    }, [id]);

    if (loading) {
        return (
            <div className="loading-container" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <Loader size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container" style={{
                padding: '2rem',
                textAlign: 'center',
                color: 'red'
            }}>
                Error: {error}
            </div>
        );
    }

    if (!project) {
        return (
            <div className="not-found-container" style={{
                padding: '2rem',
                textAlign: 'center'
            }}>
                Projet non trouvé
            </div>
        );
    }

    // Breadcrumbs items
    const items = [
        { title: 'Projets', href: '/projects' },
        { title: `Projet: ${project.nom_projet}`, href: '#' },
    ].map((item, index) => (
        <Link to={item.href} key={index}>
            {item.title}
        </Link>
    ));

    return (
        <div className='single-project-container'>
            <Breadcrumbs
                separator="→"
                separatorMargin="md"
                mt="xs"
                className='breadcrumbs-container'
            >
                {items}
            </Breadcrumbs>

            <section className="single-project-action-section">
                <Tabs defaultValue="devis" variant="pills" color='black' radius='xl'>
                    <Tabs.List>
                        <Tabs.Tab
                            value="devis"
                            leftSection={<Receipt1 size={16} />}
                        >
                            Devis
                        </Tabs.Tab>
                        <Tabs.Tab
                            value="preparation"
                            leftSection={<Calendar size={16} />}
                        >
                            Préparation
                        </Tabs.Tab>
                        <Tabs.Tab
                            value="realisation"
                            leftSection={<Timer size={16} />}
                        >
                            Réalisation
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="devis">
                        <QuoteList project={project} />
                    </Tabs.Panel>

                    <Tabs.Panel value="preparation">
                        <PrepPage
                            project={project}
                            onRefresh={refreshProject}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value="realisation">
                        <ExecPage
                            project={project}
                            onRefresh={refreshProject}
                        />
                    </Tabs.Panel>
                </Tabs>
            </section>
        </div>
    );
}