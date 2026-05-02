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
        color: '#FFD700', // Gold/Yellow
        textAlign: 'center',
        marginBottom: 30,
        marginTop: 10,
    },
    formSection: {
        backgroundColor: '#1E1E1E',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.1)',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    label: {
        fontSize: 14,
        color: '#AAAAAA',
        marginBottom: 8,
        fontWeight: '600',
    },
    readOnlyValue: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: 'bold',
        marginBottom: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        color: '#FFD700',
        marginBottom: 8,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: '#2A2A2A',
        borderRadius: 10,
        padding: 15,
        color: '#FFFFFF',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    summarySection: {
        marginTop: 10,
        paddingTop: 20,
        borderTopWidth: 2,
        borderTopColor: '#FFD700',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    summaryLabel: {
        fontSize: 16,
        color: '#AAAAAA',
    },
    summaryValue: {
        fontSize: 20,
        color: '#FFD700',
        fontWeight: 'bold',
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
    },
    balanceLabel: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    balanceValue: {
        fontSize: 22,
        color: '#FFD700',
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#FFD700',
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        flexDirection: 'row',
    },
    buttonText: {
        color: '#000000',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});

export default styles;
