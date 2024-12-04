// DetailsProject.jsx
import { Divider, Modal, ScrollArea, Text } from "@mantine/core";
import '../../styles/modal.css';
import '../../styles/projects/detailsproject.css';

export default function DetailsProject({ opened, onClose, projectData }) {
    // Find the corresponding client for this project
    const modalTitle = <Text className="main-title" size='xl'>Détails du projet</Text>

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            className="popup-modal"
            size="auto"
            centered
            title={modalTitle}
        >
            <div className="modal-content">

                <Divider className="divider" />
                <ScrollArea className="modal-form-section">
                    {/* Client Details */}
                    <div className="receipt-section">
                        <Text className="main-title">CLIENT</Text>
                        <div className="client-details">
                            <p>{projectData.client?.nom_client}</p>
                            <p>{projectData.client?.email}</p>
                            <p>{projectData.client?.contact_client}</p>
                        </div>
                    </div>

                    {/* Project Details */}
                    <div className="receipt-section">
                        <Text className="main-title">DÉTAILS DU PROJET</Text>
                        <div className="details-grid">
                            <div className="detail-row">
                                <span className="detail-label">Phase:</span>
                                <span className="detail-value">{projectData.phase_projet}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Adresse:</span>
                                <span className="detail-value">{projectData.adresse_chantier}</span>
                            </div>
                            {/* <div className="detail-row">
                                <span className="detail-label">Date création:</span>
                                <span className="detail-value">
                                    {new Date(projectData.created_at).toLocaleDateString()}
                                </span>
                            </div> */}
                        </div>
                    </div>
                    {/* Financial Details */}
                    <div className="receipt-section">
                        <Text className="main-title">FINANCES</Text>
                        <div className="details-grid">
                            <div className="detail-row">
                                <span className="detail-label">Chiffre d'affaires:</span>
                                <span className="detail-value">
                                    {projectData.chiffre_affaire.toLocaleString()} €
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Project Description */}
                    <div className="receipt-section">
                        <Text className="main-title">DESCRIPTION</Text>
                        <p className="description-text">{projectData.description_projet}</p>
                    </div>

                    {/* Footer */}
                    <div className="receipt-footer">
                        <p>{new Date().toLocaleString()}</p>
                    </div>
                </ScrollArea>
            </div>
        </Modal>
    );
}