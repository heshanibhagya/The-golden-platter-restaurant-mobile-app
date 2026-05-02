import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212', // Dark background
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFD700',
        marginTop: 40,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#AAA',
        textAlign: 'center',
        marginBottom: 30,
    },
    statusCard: {
        backgroundColor: '#1E1E1E',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        marginBottom: 20,
        elevation: 8,
    },
    orderIdLabel: {
        color: '#888',
        fontSize: 14,
        marginBottom: 5,
    },
    orderIdValue: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    statusCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 8,
        borderColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    statusText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFD700',
    },
    itemsContainer: {
        backgroundColor: '#1E1E1E',
        borderRadius: 15,
        padding: 20,
        flex: 1,
    },
    sectionTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        paddingBottom: 5,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    itemName: {
        color: '#DDD',
        fontSize: 16,
    },
    itemQty: {
        color: '#FFD700',
        fontWeight: 'bold',
    },
    billingNote: {
        backgroundColor: '#332200',
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#FFD700',
    },
    billingNoteText: {
        color: '#FFCC00',
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    refreshBtn: {
        marginTop: 20,
        backgroundColor: '#333',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    refreshBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#888',
        fontSize: 16,
    }
});

export default styles;
