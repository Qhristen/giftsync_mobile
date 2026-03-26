import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import ProgressBar from '@/components/ui/ProgressBar';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { RootState } from '@/store';
import { nextStep, updateProfile } from '@/store/slices/onboardingSlice';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as z from 'zod';

const schema = z.object({
    displayName: z.string().min(2, 'Display name is required'),
});

type FormData = z.infer<typeof schema>;

export default function OnboardingStep1() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { colors, spacing } = useTheme();
    const onboarding = useSelector((state: RootState) => state.onboarding);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            displayName: onboarding.profile.displayName || '',
        },
    });

    const onSubmit = (data: FormData) => {
        dispatch(updateProfile(data));
        dispatch(nextStep());
        router.push('/(auth)/onboarding/step-3-confirm-occasions');
    };

    const personas = [
        { label: 'Busy Professional', value: 'Busy Professional', icon: '💼' },
        { label: 'Social Connector', value: 'Social Connector', icon: '🤝' },
        { label: 'Thoughtful Giver', value: 'Thoughtful Giver', icon: '🎁' },
    ] as const;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { padding: spacing.xl }]}>
                <ProgressBar progress={0.25} />
                <Typography variant="h2" style={{ marginTop: spacing.xl }}>
                    Setup your profile
                </Typography>
                <Typography variant="body" color={colors.textSecondary}>
                    Tell us a bit about yourself.
                </Typography>
            </View>

            <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: spacing.xl }]}>
                <View style={styles.avatarSection}>
                    <Avatar size="xl" name={onboarding.profile.displayName} />
                    <Button
                        title="Upload Photo"
                        variant="ghost"
                        onPress={() => { }}
                        style={styles.uploadBtn}
                    />
                </View>

                <View style={styles.form}>
                    <Controller
                        control={control}
                        name="displayName"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label="Display Name"
                                placeholder="How should we call you?"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                error={errors.displayName?.message}
                            />
                        )}
                    />

                    <Typography variant="label" color={colors.textSecondary} style={{ marginTop: spacing.md }}>
                        What kind of giver are you?
                    </Typography>
                    <View style={styles.personas}>
                        {personas.map((p) => (
                            <Card
                                key={p.value}
                                onPress={() => dispatch(updateProfile({ persona: p.value }))}
                                variant={onboarding.profile.persona === p.value ? 'elevated' : 'outline'}
                                style={[
                                    styles.personaCard,
                                    onboarding.profile.persona === p.value && { borderColor: colors.primary, borderWidth: 1.5 },
                                ]}
                            >
                                <Typography variant="h1">{p.icon}</Typography>
                                <Typography variant="label" style={{ marginTop: 8 }} align="center">
                                    {p.label}
                                </Typography>
                            </Card>
                        ))}
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { padding: spacing.xl }]}>
                <Button
                    title="Continue"
                    onPress={handleSubmit(onSubmit)}
                    style={styles.submitBtn}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 80,
    },
    content: {
        flexGrow: 1,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    uploadBtn: {
        marginTop: 8,
    },
    form: {
        gap: 16,
    },
    personas: {
        flexDirection: 'row',
        gap: 12,
    },
    personaCard: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 8,
    },
    footer: {
        width: '100%',
    },
    submitBtn: {
        width: '100%',
    },
});
