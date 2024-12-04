import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { pdfStyles } from './styles';
import { calculateTaskBudget, calculateTotals, formatPrice, getWorkTasks } from './utils';

const QuoteDocument = ({ quote, works, tasks, budgets, formatQuoteNumber, clientName }) => {
    const quoteNumber = quote ? formatQuoteNumber(quote) : 'N/A';
    const dateCreation = quote?.date_creation
        ? new Date(quote.date_creation).toLocaleDateString('fr-FR')
        : 'Date inconnue';
    const etatDevis = quote?.etat_devis
        ? quote.etat_devis.charAt(0).toUpperCase() + quote.etat_devis.slice(1).replace('_', ' ')
        : 'État inconnu';

    return (
        <Document>
            <Page size="A4" style={pdfStyles.page}>
                <View style={pdfStyles.header}>
                    <Text style={pdfStyles.title}>Devis N° {quoteNumber}</Text>
                    <Text style={pdfStyles.subtitle}>
                        Client: {clientName ?? 'Nom inconnu'}{'\n'}
                        Date: {dateCreation}{'\n'}
                        État: {etatDevis}
                    </Text>
                </View>

                <View style={pdfStyles.table}>
                    <View style={pdfStyles.tableHeader}>
                        <Text style={pdfStyles.col1}>Ouvrage / Tâche</Text>
                        <Text style={pdfStyles.col2}>Main d'oeuvre</Text>
                        <Text style={pdfStyles.col3}>Matériaux</Text>
                        <Text style={pdfStyles.col4}>Matériel</Text>
                        <Text style={pdfStyles.col5}>Sous-traitance</Text>
                        <Text style={pdfStyles.col6}>Total</Text>
                    </View>

                    {works.map(work => (
                        <React.Fragment key={work.id}>
                            <View style={pdfStyles.workRow}>
                                <Text style={pdfStyles.col1}>{work.nom_ouvrage ?? 'Nom inconnu'}</Text>
                                <Text style={pdfStyles.col2}></Text>
                                <Text style={pdfStyles.col3}></Text>
                                <Text style={pdfStyles.col4}></Text>
                                <Text style={pdfStyles.col5}></Text>
                                <Text style={pdfStyles.col6}></Text>
                            </View>

                            {getWorkTasks(work.id, tasks).map(task => {
                                const moBudget = calculateTaskBudget(task.id, 'mo', budgets) ?? 0;
                                const materiauxBudget = calculateTaskBudget(task.id, 'materiaux', budgets) ?? 0;
                                const materielBudget = calculateTaskBudget(task.id, 'materiel', budgets) ?? 0;
                                const sousTraitanceBudget = calculateTaskBudget(task.id, 'sous_traitance', budgets) ?? 0;
                                const totalBudget = moBudget + materiauxBudget + materielBudget + sousTraitanceBudget;

                                return (
                                    <View style={pdfStyles.tableRow} key={task.id}>
                                        <Text style={pdfStyles.col1}>{task.nom_tache ?? 'Nom inconnu'}</Text>
                                        <Text style={pdfStyles.col2}>{formatPrice(moBudget)}</Text>
                                        <Text style={pdfStyles.col3}>{formatPrice(materiauxBudget)}</Text>
                                        <Text style={pdfStyles.col4}>{formatPrice(materielBudget)}</Text>
                                        <Text style={pdfStyles.col5}>{formatPrice(sousTraitanceBudget)}</Text>
                                        <Text style={pdfStyles.col6}>{formatPrice(totalBudget)}</Text>
                                    </View>
                                );
                            })}
                        </React.Fragment>
                    ))}

                    <View style={pdfStyles.totalRow}>
                        <Text style={pdfStyles.col1}>Total</Text>
                        <Text style={pdfStyles.col2}>{formatPrice(calculateTotals(tasks, budgets)?.moTotal ?? 0)}</Text>
                        <Text style={pdfStyles.col3}>{formatPrice(calculateTotals(tasks, budgets)?.materiauxTotal ?? 0)}</Text>
                        <Text style={pdfStyles.col4}>{formatPrice(calculateTotals(tasks, budgets)?.materielTotal ?? 0)}</Text>
                        <Text style={pdfStyles.col5}>{formatPrice(calculateTotals(tasks, budgets)?.sousTraitanceTotal ?? 0)}</Text>
                        <Text style={pdfStyles.col6}>{formatPrice(calculateTotals(tasks, budgets)?.total ?? 0)}</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default QuoteDocument;
