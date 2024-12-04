import { Button, Divider, Drawer, Menu, rem, Table, Text } from "@mantine/core";
import { modals } from '@mantine/modals';
import { Edit } from 'iconsax-react';
import { Check, ChevronDown, Mail, Trash, X } from 'lucide-react';
import { Fragment, useState } from 'react';

import { useDisclosure } from '@mantine/hooks';
import '../../styles/projects/quotes/quotedetails.css';

import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import SendQuoteEmailModal from '../../components/modals/SendQuoteEmailModal';
import { useQuoteStore } from "../../stores/quoteStore";
import EditQuote from './edit-quote/EditQuote';
import QuotePDFButton from './pdf/QuotePDFButton';

import { useInvoiceStore } from '../../stores/invoiceStore';

export default function QuoteDetails({
    opened,
    onClose,
    quote,
    works,
    tasks,
    budgets,
    formatQuoteNumber,
    clientName,
    clientEmail,
    projectName,
    projectPhase,
    onQuoteDeleted
}) {
    const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
    const { createInvoice } = useInvoiceStore();

    const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
    const [emailOpened, { open: openEmail, close: closeEmail }] = useDisclosure(false);

    const { deleteQuote, updateQuote, updateProjectPhase } = useQuoteStore();

    // Helper function to calculate budget for a specific task and type
    const calculateTaskBudget = (tache_id, budgetType) => {
        const relevantBudget = budgets?.find(
            budget => budget.tache_id === tache_id &&
                budget.subtype === `budget_${budgetType}` &&
                budget.type === 'previsionnel'
        );

        if (!relevantBudget) return 0;
        return relevantBudget.prix_unitaire * relevantBudget.quantite;
    };

    // Calculate totals for the quote
    const calculateTotals = () => {
        let moTotal = 0;
        let materiauxTotal = 0;
        let materielTotal = 0;
        let sousTraitanceTotal = 0;

        tasks.forEach(task => {
            moTotal += calculateTaskBudget(task.id, 'mo');
            materiauxTotal += calculateTaskBudget(task.id, 'materiaux');
            materielTotal += calculateTaskBudget(task.id, 'materiel');
            sousTraitanceTotal += calculateTaskBudget(task.id, 'sous_traitance');
        });

        return {
            moTotal,
            materiauxTotal,
            materielTotal,
            sousTraitanceTotal,
            total: moTotal + materiauxTotal + materielTotal + sousTraitanceTotal
        };
    };

    const handleEditClick = () => {
        openEdit();
    };

    const getWorkTasks = (ouvrage_id) => {
        return tasks.filter(task => task.ouvrage_id === ouvrage_id);
    };

    const formatPrice = (price) => {
        return price.toLocaleString('fr-FR') + ' €';
    };

    const openDeleteModal = () =>
        modals.openConfirmModal({
            title: <Text className="main-title">Supprimer le devis</Text>,
            centered: true,
            children: (
                <Text size="sm">
                    Êtes-vous sûr de vouloir supprimer ce devis ? Cette action est irréversible,
                    et toutes les données associées à ce devis seront définitivement perdues.
                </Text>
            ),
            labels: { confirm: 'Supprimer', cancel: "Non, ne pas poursuivre" },
            confirmProps: { color: 'red' },
            onCancel: () => console.log('Cancel'),
            onConfirm: async () => {
                await deleteQuote(quote.id);
                notifications.show({
                    title: 'Succès',
                    message: 'Toutes les informations sur ce devis ont été supprimées avec succès',
                    color: 'teal',
                    icon: <IconCheck style={{ width: rem(20), height: rem(20) }} />,
                    autoClose: 3000,
                    withCloseButton: true,
                    styles: (theme) => ({
                        root: {
                            backgroundColor: theme.colors.teal[0],
                            borderColor: theme.colors.teal[6],
                        },
                        title: {
                            color: theme.colors.teal[9],
                        },
                        description: {
                            color: theme.colors.teal[9],
                        },
                        closeButton: {
                            color: theme.colors.teal[9],
                            '&:hover': {
                                backgroundColor: theme.colors.teal[1],
                            },
                        },
                    }),
                });
                await onQuoteDeleted(); // Call the callback after successful deletion
            },
        });

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await updateQuote(id, { etat_devis: newStatus });
            if (newStatus === 'validé') {
                await updateProjectPhase(quote.projet_id, 'next');
            } else {
                await updateProjectPhase(quote.projet_id, 'previous');
            }
            await onQuoteDeleted(); // Call the callback after successful action
            notifications.show({
                title: 'Succès',
                message: 'Statut du devis mis à jour avec succès',
                color: 'teal',
                icon: <IconCheck style={{ width: rem(20), height: rem(20) }} />,
                autoClose: 3000,
                withCloseButton: true,
                styles: (theme) => ({
                    root: {
                        backgroundColor: theme.colors.teal[0],
                        borderColor: theme.colors.teal[6],
                    },
                    title: {
                        color: theme.colors.teal[9],
                    },
                    description: {
                        color: theme.colors.teal[9],
                    },
                    closeButton: {
                        color: theme.colors.teal[9],
                        '&:hover': {
                            backgroundColor: theme.colors.teal[1],
                        },
                    },
                }),
            });

        } catch (error) {
            console.log('Error updating quote status: ', error);
            notifications.show({
                title: 'Erreur',
                message: 'Une erreur s\'est produite lors de la mise à jour du statut du devis',
                color: 'red',
                icon: <IconX style={{ width: rem(20), height: rem(20) }} />,
                autoClose: 3000,
                withCloseButton: true,
                styles: (theme) => ({
                    root: {
                        backgroundColor: theme.colors.red[0],
                        borderColor: theme.colors.red[6],
                    },
                    title: {
                        color: theme.colors.red[9],
                    },
                    description: {
                        color: theme.colors.red[9],
                    },
                    closeButton: {
                        color: theme.colors.red[9],
                        '&:hover': {
                            backgroundColor: theme.colors.red[1],
                        },
                    },
                }),
            });
        }
    };

    const handleCreateInvoice = async () => {
        setIsCreatingInvoice(true);
        try {
            await createInvoice(quote.id);
            notifications.show({
                title: 'Succès',
                message: 'La facture a été créée avec succès',
                color: 'teal',
                icon: <IconCheck style={{ width: rem(20), height: rem(20) }} />,
                autoClose: 3000,
                withCloseButton: true,
                styles: (theme) => ({
                    root: {
                        backgroundColor: theme.colors.teal[0],
                        borderColor: theme.colors.teal[6],
                    },
                    title: {
                        color: theme.colors.teal[9],
                    },
                    description: {
                        color: theme.colors.teal[9],
                    },
                    closeButton: {
                        color: theme.colors.teal[9],
                        '&:hover': {
                            backgroundColor: theme.colors.teal[1],
                        },
                    },
                }),
            });
            onClose(); // Close the drawer after successful creation
        } catch (error) {
            console.error('Error creating invoice:', error);
            notifications.show({
                title: 'Erreur',
                message: 'Une erreur s\'est produite lors de la création de la facture',
                color: 'red',
                icon: <IconX style={{ width: rem(20), height: rem(20) }} />,
                autoClose: 3000,
                withCloseButton: true,
                styles: (theme) => ({
                    root: {
                        backgroundColor: theme.colors.red[0],
                        borderColor: theme.colors.red[6],
                    },
                    title: {
                        color: theme.colors.red[9],
                    },
                    description: {
                        color: theme.colors.red[9],
                    },
                    closeButton: {
                        color: theme.colors.red[9],
                        '&:hover': {
                            backgroundColor: theme.colors.red[1],
                        },
                    },
                }),
            });
        } finally {
            setIsCreatingInvoice(false);
        }
    };


    return (
        <>
            <Drawer
                opened={opened}
                onClose={onClose}
                className="popup-modal"
                size={1000}
                position="right"

            >
                <div className="modal-content">
                    <section className="modal-title-section">
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '32px'
                            }}
                        >
                            <h1 className="main-title">Devis N° {quote && formatQuoteNumber(quote)}</h1>
                            {quote?.etat_devis != 'validé' &&
                                <Edit size={24} className='custom-action-button'
                                    onClick={handleEditClick}
                                />
                            }
                        </div>
                        <Text className="main-subtitle" c="dimmed" size="sm" mt="12">
                            {clientName} • Projet "{projectName}" • {quote && new Date(quote.date_creation).toLocaleDateString('fr-FR')} • {quote && quote.etat_devis.charAt(0).toUpperCase() + quote.etat_devis.slice(1).replace('_', ' ')}
                        </Text>
                    </section>
                    <Divider className="divider" />

                    <div className="modal-datainput-content">
                        <div className="modal-form-section" style={{ minWidth: '900px' }}>
                            <Table verticalSpacing="sm" withTableBorder withColumnBorders>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th className='bold-title'>Ouvrage / Tâche</Table.Th>
                                        <Table.Th className='bold-title'>Main d'oeuvre</Table.Th>
                                        <Table.Th className='bold-title'>Matériaux</Table.Th>
                                        <Table.Th className='bold-title'>Matériel</Table.Th>
                                        <Table.Th className='bold-title'>Sous-traitance</Table.Th>
                                        <Table.Th className='bold-title'>Total</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {works.map(work => (
                                        <Fragment key={work.id}>
                                            <Table.Tr style={{ backgroundColor: '#f8f9fa' }}>
                                                <Table.Td colSpan={6} style={{ fontWeight: 'bold' }} className='bold-title'>
                                                    {work.nom_ouvrage}
                                                </Table.Td>
                                            </Table.Tr>
                                            {getWorkTasks(work.id).map(task => {
                                                const moBudget = calculateTaskBudget(task.id, 'mo');
                                                const materiauxBudget = calculateTaskBudget(task.id, 'materiaux');
                                                const materielBudget = calculateTaskBudget(task.id, 'materiel');
                                                const sousTraitanceBudget = calculateTaskBudget(task.id, 'sous_traitance');
                                                const totalBudget = moBudget + materiauxBudget + materielBudget + sousTraitanceBudget;

                                                return (
                                                    <Table.Tr key={task.id}>
                                                        <Table.Td style={{ paddingLeft: '2rem' }}>{task.nom_tache}</Table.Td>
                                                        <Table.Td>{formatPrice(moBudget)}</Table.Td>
                                                        <Table.Td>{formatPrice(materiauxBudget)}</Table.Td>
                                                        <Table.Td>{formatPrice(materielBudget)}</Table.Td>
                                                        <Table.Td>{formatPrice(sousTraitanceBudget)}</Table.Td>
                                                        <Table.Td>{formatPrice(totalBudget)}</Table.Td>
                                                    </Table.Tr>
                                                );
                                            })}
                                        </Fragment>
                                    ))}
                                </Table.Tbody>

                                <Table.Tfoot>
                                    <Table.Tr style={{ backgroundColor: '#f8f9fa' }}>
                                        <Table.Td style={{ fontWeight: 'bold' }} className='bold-title'>Total</Table.Td>
                                        <Table.Td style={{ fontWeight: 'bold' }} className='bold-title'>{formatPrice(calculateTotals().moTotal)}</Table.Td>
                                        <Table.Td style={{ fontWeight: 'bold' }} className='bold-title'>{formatPrice(calculateTotals().materiauxTotal)}</Table.Td>
                                        <Table.Td style={{ fontWeight: 'bold' }} className='bold-title'>{formatPrice(calculateTotals().materielTotal)}</Table.Td>
                                        <Table.Td style={{ fontWeight: 'bold' }} className='bold-title'>{formatPrice(calculateTotals().sousTraitanceTotal)}</Table.Td>
                                        <Table.Td style={{ fontWeight: 'bold' }} className='bold-title'>{formatPrice(calculateTotals().total)}</Table.Td>
                                    </Table.Tr>
                                </Table.Tfoot>
                            </Table>
                        </div>

                        <div className="modal-action-button" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            marginTop: '2rem',
                            width: '100%'
                        }}>
                            <Button
                                variant="filled"
                                size="md"
                                className="primary-button"
                                fullWidth
                                loading={isCreatingInvoice}
                                onClick={handleCreateInvoice}
                                disabled={quote?.etat_devis !== 'validé'} // Only enable for validated quotes
                            >
                                Facturer
                            </Button>

                            {quote?.etat_devis !== 'validé' && <Menu
                                width="100%"
                                shadow='md'
                                position='top'
                                withArrow
                                transitionProps={{ transition: 'slide-up' }}
                            >
                                <Menu.Target>
                                    <Button
                                        variant="outline"
                                        rightSection={<ChevronDown size={14} />}
                                        size="lg"
                                        fullWidth
                                    >
                                        Marquer comme...
                                    </Button>
                                </Menu.Target>

                                <Menu.Dropdown
                                    style={{
                                        width: 300
                                    }}
                                >
                                    <Menu.Item onClick={() => handleUpdateStatus(quote.id, 'validé')}>
                                        <div className="quote-status-item">
                                            <Check size={16} />
                                            <Text>Validé</Text>
                                            {/*Change etat_devis to 'validé' and change project phase to 'preparation'*/}
                                        </div>
                                    </Menu.Item>
                                    <Menu.Item onClick={() => handleUpdateStatus(quote.id, 'refusé')}>
                                        <div className="quote-status-item">
                                            <X size={16} />
                                            <Text>Refusé</Text>
                                        </div>
                                    </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>}
                            {quote?.etat_devis == 'validé' &&
                                <Button
                                    variant="outline"
                                    size="lg"
                                    fullWidth
                                    onClick={() => handleUpdateStatus(quote.id, 'en attente')}
                                >
                                    Annuler
                                </Button>
                            }
                            <Button
                                variant="outline"
                                size="md"
                                leftSection={<Mail size={14} />}
                                fullWidth
                                onClick={() => {
                                    openEmail();
                                    console.log('Email quote: ', quote)
                                }

                                }
                            >
                                Envoyer par e-mail
                            </Button>

                            <QuotePDFButton
                                quote={quote}
                                works={works}
                                tasks={tasks}
                                budgets={budgets}
                                formatQuoteNumber={formatQuoteNumber}
                                clientName={clientName}
                            />

                            {quote?.etat_devis != 'validé' &&
                                <Button
                                    variant="outline"
                                    size="md"
                                    leftSection={<Trash size={14} />}
                                    fullWidth
                                    color='red'
                                    onClick={openDeleteModal}
                                >
                                    Supprimer
                                </Button>
                            }
                        </div>
                    </div>
                </div>
            </Drawer >
            <EditQuote
                editOpened={editOpened}
                closeEdit={closeEdit}
                quote={quote}
                works={works}
                tasks={tasks}
                budgets={budgets}
                formatQuoteNumber={formatQuoteNumber}
            />
            <SendQuoteEmailModal
                opened={emailOpened}
                closeParent={onClose}
                onClose={closeEmail}
                quote={quote}
                works={works}
                tasks={tasks}
                budgets={budgets}
                formatQuoteNumber={formatQuoteNumber}
                clientName={clientName}
                clientEmail={clientEmail}
                projectName={projectName}
                projectPhase={projectPhase}
            />
        </>
    );
}