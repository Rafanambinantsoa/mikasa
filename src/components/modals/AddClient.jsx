import { Button, Divider, Drawer, rem, Text, TextInput } from "@mantine/core";
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';

import { IconCheck } from '@tabler/icons-react';
import { CircleAlert } from "lucide-react";

import { PhoneNumberUtil } from 'google-libphonenumber';
import { PhoneInput } from 'react-international-phone';

import { useClientStore } from "../../stores/clientStore";
import '../../styles/modal.css';

const phoneUtil = PhoneNumberUtil.getInstance();

const isPhoneValid = (phone) => {
    try {
        return phoneUtil.isValidNumber(phoneUtil.parseAndKeepRawInput(phone));
    } catch (error) {
        return false;
    }
};

export default function AddClient({ addOpened, addClose }) {
    const [phoneTouched, setPhoneTouched] = useState(false);
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const { createClient, getClients } = useClientStore()

    const form = useForm({
        initialValues: {
            nom_client: '',
            email: '',
            contact_client: '',
        },
        validate: {
            nom_client: (value) => !value ? 'Le nom du client est requis' : null,
            email: (value) => {
                if (!value) return "L'adresse e-mail est requise";
                if (!emailPattern.test(value)) return "L'adresse e-mail saisie est invalide";
                return null;
            },
            contact_client: (value) => {
                if (phoneTouched && !isPhoneValid(value)) return 'Le numéro de téléphone est invalide';
                return null;
            },
        }
    });

    const handleSubmit = async (values) => {
        const newClient = {
            ...values,
            created_at: new Date().toISOString().split('T')[0],
        };
        await createClient(newClient);
        getClients();

        notifications.show({
            title: 'Succès',
            message: 'Le client a été créé avec succès!',
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
        addClose();
    };

    const phoneInputCustomStyles = `
        .react-international-phone-input {
            height: 36px !important;
            border-radius: 4px !important;
            border: 1px solid #ced4da !important;
            font-size: 14px !important;
        }
        .react-international-phone-input:focus-within {
            border-color: #228be6 !important;
        }
        .react-international-phone-country-selector-button {
            border-right: 1px solid #ced4da !important;
            background: transparent !important;
        }
        .react-international-phone-input-container {
            margin-top: 8px;
        }
    `;

    return (
        <Drawer
            opened={addOpened}
            onClose={addClose}
            className="popup-modal"
            size="auto"
            position="right"
        >
            <style>{phoneInputCustomStyles}</style>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <div className="modal-content">
                    <section className="modal-title-section">
                        <h1 className="main-title">Ajouter un client</h1>
                        <Text className="main-subtitle" c="dimmed" size='sm' mt='12'>
                            Ajouter un nouveau client à votre liste de clients
                        </Text>
                    </section>
                    <Divider className="divider" />
                    <div className="modal-datainput-content">
                        <div className="modal-form-section">
                            <TextInput
                                label="Nom du client"
                                placeholder="Nom du client"
                                withAsterisk
                                {...form.getInputProps('nom_client')}
                            />
                            <TextInput
                                label="Adresse e-mail"
                                placeholder="exemple@email.com"
                                withAsterisk
                                {...form.getInputProps('email')}
                            />
                            <div className="form-group">
                                <label className="mantine-InputWrapper-label mantine-TextInput-label">
                                    Numéro de téléphone<span className="mantine-InputWrapper-required">*</span>
                                </label>
                                <PhoneInput
                                    defaultCountry="fr"
                                    value={form.values.contact_client}
                                    onChange={(phone) => {
                                        form.setFieldValue('contact_client', phone);
                                        setPhoneTouched(true); // Mark as touched on change
                                        if (!isPhoneValid(phone) && phoneTouched) {
                                            form.setFieldError('contact_client', 'Le numéro de téléphone est invalide');
                                        } else {
                                            form.clearFieldError('contact_client');
                                        }
                                    }}
                                    inputStyle={{
                                        width: '100%',
                                        height: '36px',
                                        fontSize: '14px',
                                    }}
                                />
                                {phoneTouched && form.errors.contact_client && (
                                    <div className="textinput-error">
                                        <CircleAlert size={12} />
                                        {form.errors.contact_client}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-action-button">
                            <Button
                                fullWidth
                                size="md"
                                type="submit"
                                disabled={!form.isValid()}
                            >
                                Créer le client
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </Drawer>
    );
}
