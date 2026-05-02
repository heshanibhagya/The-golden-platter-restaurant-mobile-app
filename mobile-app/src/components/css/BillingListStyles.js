import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212', // Dark background
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#1E1E1E',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 215, 0, 0.2)',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#FFD700', // Gold/Yellow
    },
    addButton: {
        backgroundColor: '#FFD700',
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    listContainer: {
        padding: 15,
        paddingBottom: 30,
    },
    card: {
        backgroundColor: '#1E1E1E',
        borderRadius: 15,
        padding: 18,
        marginBottom: 15,
        borderLeftWidth: 5,
        borderLeftColor: '#FFD700',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    customerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusPaid: {
        backgroundColor: '#4CAF50', // Green for Paid
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textTransform: 'uppercase',
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    amount: {
        fontSize: 20,
        color: '#FFD700',
        fontWeight: 'bold',
    },
    date: {
        fontSize: 13,
        color: '#AAAAAA',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        paddingTop: 12,
    },
    viewInvoiceBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    viewInvoiceText: {
        color: '#FFD700',
        fontSize: 13,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    deleteButton: {
        backgroundColor: '#F44336',
        padding: 8,
        borderRadius: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: '#666666',
        fontSize: 16,
        marginTop: 15,
    },
});

export default styles;
