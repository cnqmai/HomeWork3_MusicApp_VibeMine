import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Image, 
    TouchableOpacity, 
    ScrollView,
    Switch 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Hardcode màu sắc
const BRAND_COLORS = {
    PRIMARY_GREEN: "#bde1a0",
    BACKGROUND: "#FFFFFF",
    TEXT_DARK: "#333333",
    TEXT_LIGHT: "#666666",
    BORDER: "#E0E0E0",
    CONTROL_BG: '#E8F6F1',
};

const USER_PROFILE_PIC = {uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'};

export default function ProfileScreen() {
    const [crossfadeEnabled, setCrossfadeEnabled] = React.useState(true);
    const [bioExpanded, setBioExpanded] = React.useState(false);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
                {/* User Info */}
                <View style={styles.userInfoContainer}>
                    <Image source={USER_PROFILE_PIC} style={styles.profileImage} />
                    <Text style={styles.userName}>Alex Johnson</Text>
                    <Text style={styles.userHandle}>@alexjohnson_beats</Text>
                    <TouchableOpacity style={styles.editProfileButton}>
                        <Text style={styles.editProfileButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* Personal Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    <TouchableOpacity 
                        style={styles.infoItem} 
                        onPress={() => setBioExpanded(!bioExpanded)}
                        activeOpacity={0.7}
                    >
                        <View>
                            <Text style={styles.infoItemLabel}>Bio</Text>
                            <Text 
                                style={styles.infoItemValue} 
                                numberOfLines={bioExpanded ? undefined : 1}
                            >
                                Music producer, DJ, and sound enthusiast.
                            </Text>
                        </View>
                        <Ionicons 
                            name={bioExpanded ? "chevron-up" : "chevron-down"} 
                            size={20} 
                            color={BRAND_COLORS.TEXT_LIGHT} 
                        />
                    </TouchableOpacity>
                </View>
                
                {/* Playback Customization */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Playback Customization</Text>
                    <View style={styles.settingItem}>
                        <Ionicons name="swap-horizontal-outline" size={24} color={BRAND_COLORS.TEXT_DARK} />
                        <Text style={styles.settingItemText}>Crossfade Songs</Text>
                        <Switch
                            trackColor={{ false: '#767577', true: BRAND_COLORS.PRIMARY_GREEN }}
                            thumbColor={crossfadeEnabled ? BRAND_COLORS.PRIMARY_GREEN : "#f4f3f4"}
                            onValueChange={setCrossfadeEnabled}
                            value={crossfadeEnabled}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: BRAND_COLORS.BACKGROUND,
    },
    scrollViewContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    userInfoContainer: {
        alignItems: 'center',
        paddingVertical: 20,
        marginBottom: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: BRAND_COLORS.TEXT_DARK,
        marginBottom: 5,
    },
    userHandle: {
        fontSize: 16,
        color: BRAND_COLORS.TEXT_LIGHT,
        marginBottom: 15,
    },
    editProfileButton: {
        backgroundColor: BRAND_COLORS.CONTROL_BG,
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: BRAND_COLORS.BORDER,
    },
    editProfileButtonText: {
        color: BRAND_COLORS.PRIMARY_GREEN,
        fontSize: 16,
        fontWeight: '600',
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: BRAND_COLORS.TEXT_DARK,
        marginBottom: 15,
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: BRAND_COLORS.BORDER,
    },
    infoItemLabel: {
        fontSize: 14,
        color: BRAND_COLORS.TEXT_LIGHT,
        marginBottom: 2,
    },
    infoItemValue: {
        fontSize: 16,
        color: BRAND_COLORS.TEXT_DARK,
        maxWidth: '90%',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: BRAND_COLORS.BORDER,
    },
    settingItemText: {
        fontSize: 16,
        color: BRAND_COLORS.TEXT_DARK,
        marginLeft: 15,
        flex: 1,
    },
});