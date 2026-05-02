import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 15,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 20,
        textAlign: 'center',
        marginTop: 10,
    },
    card: {
        backgroundColor: '#1e1e1e',
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
        borderLeftWidth: 5,
        borderLeftColor: '#ee5253', // Red for Pending
        elevation: 5,
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
        color: '#aaa',
        fontSize: 14,
    },
    time: {
        color: '#888',
        fontSize: 12,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 4,
    },
    itemName: {
        color: '#eee',
        fontSize: 16,
        fontWeight: '500',
    },
    itemQty: {
        color: '#FFD700',
        fontWeight: 'bold',
    },
    noteContainer: {
        marginTop: 10,
        backgroundColor: '#2d3436',
        padding: 8,
        borderRadius: 8,
    },
    noteText: {
        color: '#fab1a0',
        fontSize: 13,
        fontStyle: 'italic',
    },
    actionButton: {
        backgroundColor: '#FFD700',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 10,
        marginTop: 15,
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#888',
        fontSize: 18,
    },
    previewImage: {
        width: '100%',
        height: 120,
        borderRadius: 10,
        marginTop: 10,
        resizeMode: 'cover',
    },
    readyButton: {
        backgroundColor: '#28a745', // Green background
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 10,
        marginTop: 15,
    },
});

export default styles;
