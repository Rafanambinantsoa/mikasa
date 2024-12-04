import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@mantine/core';
import { FileDown } from 'lucide-react';
import QuoteDocument from './QuoteDocument';

const QuotePDFButton = (props) => {
    // Check if required props are available
    const isDataReady = props.quote;

    // If data is not ready, render a disabled button
    if (!isDataReady) {
        return (
            <Button
                variant="outline"
                size="md"
                leftSection={<FileDown size={14} />}
                fullWidth
                disabled
            >
                Télécharger le PDF
            </Button>
        );
    }

    // Render the PDF download link when data is ready
    return (
        <PDFDownloadLink
            document={<QuoteDocument {...props} />}
            fileName={`Devis_${props.formatQuoteNumber(props.quote)}.pdf`}
        >
            {({ loading }) => (
                <Button
                    variant="outline"
                    size="md"
                    leftSection={<FileDown size={14} />}
                    fullWidth
                    loading={loading}
                >
                    Télécharger le PDF
                </Button>
            )}
        </PDFDownloadLink>
    );
};

export default QuotePDFButton;