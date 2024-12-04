import { Box, Button, Group, Modal, TextInput, Textarea, rem } from '@mantine/core';
import React, { useEffect, useState } from 'react';

import { notifications } from '@mantine/notifications';
import { IconCheck, IconLoader2 } from '@tabler/icons-react';
import { toast } from 'sonner';
import { useQuoteStore } from '../../stores/quoteStore';

const SendQuoteEmailModal = ({
    opened,
    onClose,
    closeParent,
    quote,
    works,
    tasks,
    budgets,
    formatQuoteNumber,
    clientName,
    clientEmail,
    projectName,
    projectPhase
}) => {
    //Use useEffect to update the subject when quote changes
    const [emailSubject, setEmailSubject] = useState('');

    useEffect(() => {
        if (quote) {
            setEmailSubject(`Devis N° ${formatQuoteNumber(quote)} - ${projectName}`);
        }
    }, [quote, formatQuoteNumber, projectName]);

    const [emailBody, setEmailBody] = useState(`Bonjour, 

    Je vous prie de trouver ci-joint le devis détaillé pour le projet "${projectName}", actuellement en phase de ${projectPhase}.

    Ce devis comprend l'ensemble des travaux et prestations nécessaires à la réalisation de votre projet. Nous avons pris soin de détailler chaque poste afin de vous donner une vision claire et transparente des coûts.

    Merci de bien vouloir examiner attentivement ce document. Si vous avez la moindre question ou si vous souhaitez des précisions, n'hésitez pas à me contacter.

    Dans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

    Cordialement,
    [Votre Nom]
    [Votre Entreprise]`);

    const [isLoading, setIsLoading] = useState(false);

    // const sendQuoteEmail = useQuoteStore(state => state.sendQuoteEmail);
    const handleSendEmail = async () => {
        // Disable submit button and show loading notification
        setIsLoading(true);
        const loadingNotificationId = notifications.show({
            loading: true,
            title: 'Chargement',
            message: 'Veuillez patienter jusqu\'à ce que votre demande soit traitée',
            color: 'blue',
            autoClose: false,
            withCloseButton: false,
            icon: <IconLoader2 className="animate-spin" />
        });
        try {
            await useQuoteStore.getState().sendQuoteEmail({
                to: clientEmail,
                subject: emailSubject,
                body: emailBody,
                reference: formatQuoteNumber(quote),
                clientName,
                quote,
                works,
                tasks,
                budgets
            });

            // Hide loading notification
            notifications.hide(loadingNotificationId);

            notifications.show({
                title: 'Succès',
                message: 'Devis envoyé avec succès!',
                color: 'teal',
                icon: <IconCheck style={{ width: rem(20), height: rem(20) }} />,
                autoClose: 5000,
                withCloseButton: true,
                styles: (theme) => ({
                    root: { backgroundColor: theme.colors.teal[0], borderColor: theme.colors.teal[6] },
                    title: { color: theme.colors.teal[9] },
                    description: { color: theme.colors.teal[9] },
                    closeButton: {
                        color: theme.colors.teal[9],
                        '&:hover': { backgroundColor: theme.colors.teal[1] },
                    },
                }),
            });

            onClose(); // Close modal only on successful email send
            closeParent();
        } catch (error) {
            console.error('Error sending email:', error);

            // Hide loading notification
            notifications.hide(loadingNotificationId);

            // More detailed error logging
            if (error.response) {
                // The request was made and the server responded with a status code
                console.error('Error response:', error.response.data);
                console.error('Error status:', error.response.status);

                toast.error(
                    error.response.data?.message ||
                    'Une erreur est survenue lors de l\'envoi du devis'
                );
            } else if (error.request) {
                // The request was made but no response was received
                console.error('No response received:', error.request);
                toast.error('Aucune réponse du serveur. Veuillez réessayer.');
            } else {
                // Something happened in setting up the request
                console.error('Error setting up request:', error.message);
                toast.error('Une erreur inattendue est survenue');
            }
        }
        finally {
            // Always reset loading state
            setIsLoading(false);
        }
    };


    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={`Envoyer le devis à ${clientName}`}
            size="xl"
        >
            <Box mx="auto">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSendEmail();
                }}>
                    <TextInput
                        label="Destinataire"
                        value={clientEmail}
                        disabled
                        mb="md"
                    />
                    <TextInput
                        label="Objet"
                        value={emailSubject}
                        onChange={(event) => setEmailSubject(event.currentTarget.value)}
                        mb="md"
                    />
                    <Textarea
                        label="Corps de l'email"
                        value={emailBody}
                        onChange={(event) => setEmailBody(event.currentTarget.value)}
                        autosize
                        minRows={10}
                        mb="md"
                    />
                    <Group justify="space-between" mt="md">
                        <Group>
                            <Button
                                variant="default"
                                onClick={onClose}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                color="blue"
                                loading={isLoading}
                                disabled={isLoading}
                            >
                                Envoyer
                            </Button>
                        </Group>
                    </Group>
                </form>
            </Box>
            {/* <>A</> */}
        </Modal>
    );
};

export default SendQuoteEmailModal;