import { Divider, Loader, Tabs, Text } from '@mantine/core';
import { Add, Briefcase, People } from 'iconsax-react';
import ButtonComponent from '../components/ButtonComponent';
import '../styles/workers/workers.css';

import { useDisclosure } from '@mantine/hooks';
import JobsTable from '../components/tables/JobTable';
import WorkersTable from '../components/tables/WorkersTable';

import { useEffect, useState } from 'react';
import AddJob from '../components/modals/AddJob';
import AddWorker from '../components/modals/AddWorker';

import { useJobStore } from '../stores/jobStore'; // Adjust import path
import { useUserStore } from '../stores/userStore'; // Adjust import path

export default function Workers() {
    const { users, getUsers } = useUserStore();
    const { jobs, getJobs } = useJobStore();

    const [addWorkerOpened, { open: addWorkerOpen, close: addWorkerClose }] = useDisclosure(false);
    const [addJobOpened, { open: addJobOpen, close: addJobClose }] = useDisclosure(false);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            await Promise.all([getUsers(), getJobs()]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="workers-container">
            <Tabs defaultValue="workers">
                <Tabs.List style={{ padding: '0px 24px 0px 24px' }}>
                    <Tabs.Tab value="workers" leftSection={<People size={16} />}>
                        Ouvriers
                    </Tabs.Tab>
                    <Tabs.Tab value="jobs" leftSection={<Briefcase size={16} />}>
                        Postes
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="workers">
                    <section className="main-title-cta">
                        <div
                            className="main-title-section"
                            style={{
                                padding: 0,
                            }}>
                            <h1 className="main-title">Ouvriers</h1>
                            <Text className="main-subtitle" c="dimmed">Liste des ouvriers</Text>
                        </div>
                        <div className="add-worker-section">
                            <div>
                                <ButtonComponent
                                    fieldname={'Ajouter un ouvrier'}
                                    rightIcon={<Add size={24} />}
                                    onClick={addWorkerOpen}
                                />
                            </div>
                        </div>
                    </section>
                    <Divider className="divider" />

                    <section className="workers-list-section">
                        <div className="workers-datagrid">
                            {loading ? (
                                <div className="loading-overlay">
                                    <Loader size="xl" />
                                </div>
                            ) : (
                                <WorkersTable
                                    users={users}
                                    jobs={jobs}
                                    fetchData={fetchData}
                                />
                            )}
                        </div>
                    </section>
                </Tabs.Panel>

                <Tabs.Panel value="jobs">
                    <section className="main-title-cta">
                        <div
                            className="main-title-section"
                            style={{
                                padding: 0,
                            }}>
                            <h1 className="main-title">Postes</h1>
                            <Text className="main-subtitle" c="dimmed">Liste des postes</Text>
                        </div>
                        <div className="add-job-section">
                            <div>
                                <ButtonComponent
                                    fieldname={'Ajouter un poste'}
                                    rightIcon={<Add size={24} />}
                                    onClick={addJobOpen}
                                />
                            </div>
                        </div>
                    </section>
                    <Divider className="divider" />

                    <section className="jobs-list-section">
                        <div className="jobs-datagrid">
                            {loading ? (
                                <div className="loading-overlay">
                                    <Loader size="xl" />
                                </div>
                            ) : (
                                <JobsTable
                                    jobs={jobs}
                                    fetchData={fetchData}
                                />
                            )}
                        </div>
                    </section>
                </Tabs.Panel>
            </Tabs>

            <AddWorker
                addOpened={addWorkerOpened}
                addClose={addWorkerClose}
                jobs={jobs}
                fetchData={fetchData}
            />
            <AddJob
                addOpened={addJobOpened}
                addClose={addJobClose}
                fetchData={fetchData}
            />
        </div>
    );
}
