import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function EditProfileScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();

    const [name, setName] = useState('Alex Johnson');
    const [email, setEmail] = useState('alex@example.com');
    const [phone, setPhone] = useState('+234 812 345 6789');

    const handleSave = () => {
        router.back();
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingHorizontal: spacing.xl }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
                <Typography variant="h3">Edit Profile</Typography>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInDown.duration(400)} style={styles.avatarSection}>
                    <View>
                        <Avatar name={name} size={120} />
                        <Pressable style={[styles.cameraBtn, { backgroundColor: colors.primary }]}>
                            <Ionicons name="camera" size={20} color="#FFF" />
                        </Pressable>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ gap: spacing.lg }}>
                    <Input
                        label="Full Name"
                        placeholder="Enter your name"
                        value={name}
                        onChangeText={setName}
                        leftIcon={<Ionicons name="person-outline" size={20} color={colors.textMuted} />}
                    />
                    <Input
                        label="Email Address"
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                        leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textMuted} />}
                    />
                    <Input
                        label="Phone Number"
                        placeholder="Enter your phone"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                        leftIcon={<Ionicons name="call-outline" size={20} color={colors.textMuted} />}
                    />
                </Animated.View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <Button title="Save Changes" variant="primary" onPress={handleSave} />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    avatarSection: {
        alignItems: 'center',
        marginVertical: 32,
    },
    cameraBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: 24,
        borderTopWidth: 1,
    },
});
