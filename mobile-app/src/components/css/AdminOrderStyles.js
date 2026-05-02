import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212', // Dark background
        padding: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 20,
        marginTop: 40,
        textAlign: 'center',
    },
    orderCard: {
        backgroundColor: '#1E1E1E',
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
        elevation: 5,
        borderLeftWidth: 5,
        borderLeftColor: '#FFD700', // Pending status indicator
    },
    completedCard: {
        borderLeftColor: '#00FF00', // Green for completed
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        paddingBottom: 5,
    },
    orderId: {
        color: '#888',
        fontSize: 12,
    },
    statusBadge: {
        backgroundColor: '#333',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 5,
    },
    statusText: {
        color: '#FFD700',
        fontSize: 12,
        fontWeight: 'bold',
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 2,
    },
    itemName: {
        color: '#EEE',
        fontSize: 16,
    },
    itemQty: {
        color: '#FFD700',
        fontWeight: 'bold',
    },
    totalContainer: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
    totalPrice: {
        color: '#FFD700',
        fontSize: 20,
        fontWeight: 'bold',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 15,
        gap: 10,
    },
    completeBtn: {
        flex: 1,
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: '#dc3545',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    btnText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    emptyText: {
        color: '#888',
        textAlign: 'center',
        marginTop: 50,
        fontSize: 18,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',
    },
    readyCard: {
        borderLeftColor: '#FFD700', // Gold/Yellow for Ready for Billing
    },
    invoiceBtn: {
        flex: 1,
        backgroundColor: '#007bff', // Blue for Invoice
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        width: '100%',
    },
});

export default styles;
