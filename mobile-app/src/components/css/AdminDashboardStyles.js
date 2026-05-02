import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212', // Dark background
    },
    headerBackground: {
        width: '100%',
        height: 250,
        justifyContent: 'flex-end',
        zIndex: 1,
    },
    headerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)', // Dark overlay on background image
    },
    headerContent: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10, // Ensure content is above background image
    },
    brandText: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFD700', // Gold (Project's yellow)
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    welcomeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF', // White
        marginTop: 2,
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute', // Absolute positioning as requested
        right: 20,
        top: 40,
        zIndex: 20,
    },
    bellButton: {
        paddingRight: 15, // Separation between bell and logout
    },
    logoutButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.3)',
        zIndex: 10,
    },
    // Metrics Cards Section
    metricsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 15,
        marginTop: -30, // Position cards over header
    },
    card: {
        width: (width / 2) - 22,
        backgroundColor: '#1E1E1E', // Card background
        borderRadius: 20,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.1)', // Subtle gold border
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    cardIcon: {
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 14,
        color: '#AAAAAA', // Gray
        marginBottom: 5,
    },
    cardValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    growthText: {
        fontSize: 12,
        color: '#4CAF50', // Green for growth indicator
        marginTop: 5,
    },
    manageLink: {
        fontSize: 12,
        color: '#FFD700', // Gold
        marginTop: 5,
        textDecorationLine: 'underline',
    },
    kdsStatus: {
        fontSize: 12,
        color: '#FFD700',
        marginTop: 5,
    },
    // Quick Actions Section
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginLeft: 20,
        marginTop: 10,
        marginBottom: 15,
    },
    actionsContainer: {
        paddingHorizontal: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2A2A2A',
        padding: 15,
        borderRadius: 15,
        marginBottom: 12,
    },
    actionIcon: {
        marginRight: 15,
        backgroundColor: 'rgba(255,215,0,0.1)',
        padding: 10,
        borderRadius: 12,
    },
    actionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default styles;
