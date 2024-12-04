import { StyleSheet } from "@react-pdf/renderer";

export const pdfStyles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 12,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 12,
        color: '#666',
        marginBottom: 20,
    },
    table: {
        width: '100%',
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#000',
        backgroundColor: '#f8f9fa',
        paddingVertical: 8,
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#eee',
        paddingVertical: 8,
    },
    workRow: {
        flexDirection: 'row',
        backgroundColor: '#f8f9fa',
        paddingVertical: 8,
        fontWeight: 'bold',
    },
    totalRow: {
        flexDirection: 'row',
        borderTopWidth: 2,
        borderColor: '#000',
        paddingVertical: 8,
        fontWeight: 'bold',
        backgroundColor: '#f8f9fa',
    },
    col1: {
        width: '30%',
        paddingRight: 8,
    },
    col2: {
        width: '14%',
        textAlign: 'right',
        paddingRight: 8,
    },
    col3: {
        width: '14%',
        textAlign: 'right',
        paddingRight: 8,
    },
    col4: {
        width: '14%',
        textAlign: 'right',
        paddingRight: 8,
    },
    col5: {
        width: '14%',
        textAlign: 'right',
        paddingRight: 8,
    },
    col6: {
        width: '14%',
        textAlign: 'right',
        paddingRight: 8,
    },
});