import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212', // Dark background theme
        padding: 15,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD700', // Gold/Yellow theme color
        marginBottom: 20,
        textAlign: 'center',
        marginTop: 10,
    },
    orderCard: {
        backgroundColor: '#1E1E1E', // Dark grey/black card background
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        borderLeftWidth: 5,
        borderLeftColor: '#FFD700', // Gold border on the left side
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    readyBadge: {
        backgroundColor: '#4CAF50', // Green badge for 'Ready' status
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
    },
    readyText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    customerInfo: {
        fontSize: 14,
        color: '#AAAAAA',
        marginBottom: 5,
    },
    amountContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    totalLabel: {
        fontSize: 14,
        color: '#AAAAAA',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFD700',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: '#AAAAAA',
        fontSize: 16,
        marginTop: 10,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default styles;
