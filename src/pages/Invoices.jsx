// Invoices.jsx
import { Divider, Text, Loader } from '@mantine/core';
import { useInvoiceStore } from '../stores/invoiceStore';
import { useEffect, useState } from 'react';
import InvoiceTable from '../components/tables/InvoiceTable';
import '../styles/invoices/invoices.css';

export default function Invoices() {
    const [isLoading, setIsLoading] = useState(true);
    const {
        invoices = [],
        loading: invoicesLoading,
        getInvoices,
        deleteInvoice
    } = useInvoiceStore();

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                await getInvoices();
            } finally {
                setIsLoading(false);
            }
        };
        fetchInvoices();
    }, [getInvoices]);

    return (
        <div className="invoices-page-container">
            <section className="main-title-section">
                <h1 className="main-title">Factures</h1>
                <Text className="main-subtitle" c="dimmed">
                    Liste de toutes les factures
                </Text>
            </section>
            <Divider className="divider" />
            <section className="invoices-list-table-section">
                <section className="invoices-datagrid">
                    {isLoading || invoicesLoading ? (
                        <div className="loading-overlay">
                            <Loader size="xl" />
                        </div>
                    ) : (
                        <InvoiceTable
                            data={invoices}
                            onDeleteInvoice={deleteInvoice}
                        />
                    )}
                </section>
            </section>
        </div>
    );
}