import { Add } from "iconsax-react";
import { Divider, Text, Loader } from "@mantine/core";
import ButtonComponent from "../components/ButtonComponent";
import AddClient from "../components/modals/AddClient";
import ClientTable from "../components/tables/ClientTable";

import { useDisclosure } from "@mantine/hooks";
import { useEffect, useMemo, useState } from "react";

// Import Zustand store
import { useClientStore } from "../stores/clientStore";

import "../styles/clients/clients.css";

export default function Clients() {
    // Mantine modal state management
    const [opened, { open, close }] = useDisclosure(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [addOpened, { open: addOpen, close: addClose }] = useDisclosure(false);

    // Directly access Zustand store
    const clients = useClientStore((state) => state.clients);
    const getClients = useClientStore((state) => state.getClients);
    const loading = useClientStore((state) => state.loading)

    // Fetch client data when component mounts
    useEffect(() => {
        getClients(); // Fetch clients from the store
    }, []);

    // Filter clients based on search query
    const filteredClients = useMemo(() => {
        return clients.filter(client =>
            client.nom_client.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.contact_client.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.created_at.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [clients, searchQuery]);

    const handleSearchChange = (value) => {
        setSearchQuery(value.toString());
    };

    return (
        <div className="clients-container">
            <section className="main-title-cta">
                <div
                    className="main-title-section"
                    style={{
                        padding: 0,
                        marginBottom: 24,
                    }}>
                    <h1 className="main-title">Clients</h1>
                    <Text className="main-subtitle" c="dimmed">Liste des clients</Text>
                </div>
                <div className="add-client-section">
                    <div>
                        <ButtonComponent
                            fieldname="Ajouter un client"
                            rightIcon={<Add size={24} />}
                            onClick={addOpen}
                        />
                    </div>
                </div>
            </section>

            <Divider className="divider" />

            <section className="clients-list-section">
                <div className="clients-datagrid">
                    {loading ? (
                        <div className="loading-overlay">
                            <Loader size="xl" />
                        </div>
                    ) : (
                        <ClientTable clients={filteredClients} />
                    )}
                </div>
            </section>

            <AddClient addOpened={addOpened} addClose={addClose} />
        </div>
    );
}
