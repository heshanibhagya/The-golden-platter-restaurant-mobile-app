import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212', // Thada kalu pata (Dark background)
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFD700', // Orange pata
        marginBottom: 20,
        marginTop: 40,
        textAlign: 'center',
    },
    cartItem: {
        backgroundColor: '#1E1E1E',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 5,
    },
    itemInfo: {
        flex: 2,
    },
    itemName: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    itemPrice: {
        fontSize: 16,
        color: '#FFD700',
        marginTop: 5,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2A2A2A',
        borderRadius: 10,
        padding: 5,
    },
    qtyBtn: {
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    qtyText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 10,
    },
    removeBtn: {
        marginLeft: 15,
    },
    emptyText: {
        color: '#888',
        textAlign: 'center',
        fontSize: 18,
        marginTop: 50,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: '#333',
        paddingTop: 20,
        paddingBottom: 30,
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    totalLabel: {
        fontSize: 20,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 22,
        color: '#FFD700',
        fontWeight: 'bold',
    },
    imageUploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#333',
        padding: 12,
        borderRadius: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#FFD700',
        borderStyle: 'dashed',
    },
    imageBtnText: {
        color: '#FFD700',
        marginLeft: 10,
        fontWeight: '600',
    },
    previewImage: {
        width: '100%',
        height: 150,
        borderRadius: 10,
        marginBottom: 15,
    },
    placeOrderBtn: {
        backgroundColor: '#FFD700',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    placeOrderText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default styles;
