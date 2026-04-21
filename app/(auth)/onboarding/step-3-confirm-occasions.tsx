import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { nextStep } from '@/store/slices/onboardingSlice';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';

interface Occasion {
    id: string;
    name: string;
    type: string;
    date: string;
    avatarUrl?: string;
}

const mockOccasions: Occasion[] = [
    { id: '1', name: 'Alex Johnson', type: 'Birthday', date: 'March 24' },
    { id: '2', name: 'Sam Smith', type: 'Birthday', date: 'April 12' },
    { id: '3', name: 'Jordan Doe', type: 'Anniversary', date: 'June 05' },
];

export default function OnboardingStep3() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { colors, spacing } = useTheme();
    const [occasions, setOccasions] = useState<Occasion[]>(mockOccasions);

    const removeOccasion = (id: string) => {
        setOccasions(prev => prev.filter(o => o.id !== id));
    };

    const onContinue = () => {
        dispatch(nextStep());
        router.push('/(auth)/onboarding/step-4-first-recommendation');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { padding: spacing.xl }]}>
                <ProgressBar progress={0.75} />
                <Typography variant="h2" style={{ marginTop: spacing.xl }}>
                    Confirm Occasions
                </Typography>
                <Typography variant="body" color={colors.textSecondary}>
                    We found {occasions.length} upcoming birthdays!
                </Typography>
            </View>

            <ScrollView
                contentContainerStyle={[styles.content, { paddingHorizontal: spacing.xl }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.list}>
                    {occasions.map((o) => (
                        <Card key={o.id} variant="raised" style={styles.occasionCard}>
                            <Avatar name={o.name} size="md" uri={o.avatarUrl} />
                            <View style={styles.cardContent}>
                                <Typography variant="bodyBold">{o.name}</Typography>
                                <Typography variant="caption" color={colors.textSecondary}>{o.type} • {o.date}</Typography>
                            </View>
                            <Pressable onPress={() => removeOccasion(o.id)} style={styles.removeBtn}>
                                <Ionicons name="close-circle" size={24} color={colors.textMuted} />
                            </Pressable>
                        </Card>
                    ))}

                    <Button
                        title="Add another occasion +"
                        variant="outline"
                        onPress={() => { }}
                        style={{ marginTop: spacing.md }}
                    />
                </View>
            </ScrollView>

            <View style={[styles.footer, { padding: spacing.xl }]}>
                <Button
                    title={`Confirm ${occasions.length} Occasions`}
                    onPress={onContinue}
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
    list: {
        gap: 12,
    },
    occasionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    cardContent: {
        flex: 1,
    },
    removeBtn: {
        padding: 4,
    },
    footer: {
        width: '100%',
    },
});
