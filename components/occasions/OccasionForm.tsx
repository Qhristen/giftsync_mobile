import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Contacts from 'expo-contacts';
import React, { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Typography from '../ui/Typography';

import { useGetContactQuery } from '@/store/api/contactsApi';
import { useCreateOccasionMutation, useGetOccasionDetailQuery, useGetOccasionTemplatesQuery, useSubscribeToTemplateMutation, useUpdateOccasionMutation } from '@/store/api/occasionApi';
import { spendCoins } from '@/store/slices/walletSlice';
import { OccasionTemplate } from '@/types';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner-native';

export interface OccasionFormData {
    contactId?: string;
    type: string;
    date: string; // ISO string
    notes?: string;
}

type OccasionMode = 'select' | 'template' | 'custom';
type RecurrenceType = 'NONE' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string; icon: string }[] = [
    { value: 'NONE', label: 'One-time', icon: 'remove-circle-outline' },
    { value: 'WEEKLY', label: 'Weekly', icon: 'calendar-outline' },
    { value: 'MONTHLY', label: 'Monthly', icon: 'calendar-outline' },
    { value: 'YEARLY', label: 'Yearly', icon: 'repeat-outline' },
];

interface OccasionFormProps {
    onSuccess?: () => void;
    onCompleted?: () => void;
    onBack?: () => void;
    isLoading?: boolean;
    isEditing?: boolean;
    occasionId?: string;
    fixedContactId?: string;
    fixedContactName?: string;
}

const OccasionForm: React.FC<OccasionFormProps> = ({
    onSuccess,
    onCompleted,
    onBack,
    isLoading: externalLoading,
    isEditing,
    occasionId,
    fixedContactId,
    fixedContactName
}) => {
    const { spacing, colors } = useTheme();
    const dispatch = useDispatch();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittingTemplateId, setSubmittingTemplateId] = useState<string | null>(null);
    const [mode, setMode] = useState<OccasionMode>(isEditing ? 'custom' : 'select');
    const [selectedTemplate, setSelectedTemplate] = useState<OccasionTemplate | null>(null);

    const [selectedContactId, setSelectedContactId] = useState<string | undefined>(fixedContactId);
    const [contactName, setContactName] = useState(fixedContactName || "");
    const [contactNumber, setContactNumber] = useState("");

    const [title, setTitle] = useState<string>('Birthday');
    const [date, setDate] = useState(new Date());
    const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('YEARLY');
    const [showPicker, setShowPicker] = useState(false);

    const { data: occasionDetail, isLoading: initialOccasionLoading, isFetching: isOccasionFetching } = useGetOccasionDetailQuery(occasionId as string, { skip: !isEditing || !occasionId });
    const isFetchingOccasion = initialOccasionLoading || isOccasionFetching;
    const { data: templatesData, isLoading: isTemplatesLoading } = useGetOccasionTemplatesQuery();
    const templates = templatesData || [];

    const { data: contactById } = useGetContactQuery(fixedContactId || (isEditing ? occasionDetail?.contactId : selectedContactId) as string, {
        skip: !fixedContactId && (!isEditing || !occasionDetail?.contactId) && !selectedContactId
    });

    const [createOccasion, { isLoading: isCreatingOccasion }] = useCreateOccasionMutation();
    const [updateOccasion, { isLoading: isUpdatingOccasion }] = useUpdateOccasionMutation();
    const [subscribeToTemplate] = useSubscribeToTemplateMutation();

    React.useEffect(() => {
        if (isEditing && occasionDetail) {
            setMode('custom');
            setTitle(occasionDetail.title);
            setDate(new Date(occasionDetail.date));
            setRecurrenceType((occasionDetail.recurrenceType as RecurrenceType) || 'NONE');
            setSelectedContactId(occasionDetail.contactId);
            setContactName(occasionDetail?.contact?.name || "");
            setContactNumber(occasionDetail?.contact?.phoneNumber || "");
        }
    }, [isEditing, occasionDetail]);

    React.useEffect(() => {
        if (fixedContactId) setSelectedContactId(fixedContactId);
        if (fixedContactName) setContactName(fixedContactName);
        if (contactById && (fixedContactId || selectedContactId)) {
            setContactName(contactById.name);
            setContactNumber(contactById.phoneNumber || "");
        }
    }, [fixedContactId, fixedContactName, contactById]);

    const formattedDate = date.toLocaleString('default', { month: 'long', day: 'numeric' });

    const handleSelectTemplate = (template: OccasionTemplate) => {
        setSelectedTemplate(template);
        setTitle(template.title);
        setRecurrenceType(template.recurrence as RecurrenceType);
        const now = new Date();
        const templateDate = new Date(now.getFullYear(), template.month - 1, template.day);
        if (templateDate < now) {
            templateDate.setFullYear(now.getFullYear() + 1);
        }
        setDate(templateDate);
        setMode('template');
    };

    const handleSubscribe = async (template: OccasionTemplate) => {
        if (!fixedContactId && !selectedContactId) {
            toast.error("Error", { description: "Please select a contact first" });
            return;
        }

        setSubmittingTemplateId(template.id);
        setIsSubmitting(true);
        try {
          await subscribeToTemplate({
                contactId: (fixedContactId || selectedContactId)!,
                templateId: template.id,
            }).unwrap();  

            dispatch(spendCoins(1));
            toast.success('Subscribed!', { description: `${template.title} added successfully` });

            onSuccess?.();
            onCompleted?.();
        } catch (err: any) {
            console.error(err, 'error creating occasion');
            toast.error('Error', {
                description: err?.data?.message || 'Failed to subscribe. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
            setSubmittingTemplateId(null);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            if (isEditing && occasionId) {
                await updateOccasion({
                    id: occasionId,
                    data: {
                        contactId: selectedContactId,
                        title,
                        date: date.toISOString(),
                        recurrenceType,
                    }
                }).unwrap();
                toast.success('Success', { description: 'Occasion updated successfully!' });
            } else {
                await createOccasion({
                    contactId: selectedContactId,
                    templateId: selectedTemplate?.id,
                    title,
                    date: date.toISOString(),
                    recurrenceType,
                    recurrenceRule: { type: 'advanced', rules: [] },
                    isActive: true,
                }).unwrap();
                dispatch(spendCoins(1));
                toast.success('Success', { description: 'Occasion created successfully!' });
            }

            onSuccess?.();
            onCompleted?.();

            // Reset state
            setMode('select');
            setSelectedTemplate(null);
            setTitle('Birthday');
            setDate(new Date());
            setRecurrenceType('YEARLY');
            if (!fixedContactId) {
                setSelectedContactId(undefined);
                setContactName('');
                setContactNumber('');
            }
        } catch (err: any) {
            console.error(err);
            toast.error('Error', {
                description: err?.data?.message || 'Failed to process request. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const handlePickContact = async () => {
        try {
            if (Platform.OS === 'android') {
                const { status } = await Contacts.requestPermissionsAsync();
                if (status !== 'granted') return;
            }
            const contact = await Contacts.presentContactPickerAsync();
            if (contact) {
                const phone = contact.phoneNumbers?.[0]?.number;
                const name = contact.name;

                setContactName(name);
                setContactNumber(phone ?? "");
                setSelectedContactId(contact.id);
            }
        } catch (error) {
            console.log('Error picking contact', error);
        }
    };

    const renderModeSelector = () => (
        <View style={{ gap: spacing.lg }}>
            <Typography variant="h2">Add an Occasion</Typography>
            <Typography variant="body" color={colors.textSecondary}>
                Choose how you'd like to create this occasion.
            </Typography>

            <Pressable
                onPress={() => setMode('template')}
                style={[styles.modeCard, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}
            >
                <View style={[styles.modeIcon, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="calendar" size={24} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <Typography variant="bodyBold">{contactName ? `Add ${contactName} to Group` : 'Join Celebration Groups'}</Typography>
                    <Typography variant="caption" color={colors.textSecondary}>
                        Pick from popular holidays and celebrations
                    </Typography>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>

            <Pressable
                onPress={() => {
                    setSelectedTemplate(null);
                    setTitle('');
                    setRecurrenceType('NONE');
                    setMode('custom');
                }}
                style={[styles.modeCard, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}
            >
                <View style={[styles.modeIcon, { backgroundColor: colors.secondary + '15' }]}>
                    <Ionicons name="create" size={24} color={colors.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                    <Typography variant="bodyBold">Create Custom</Typography>
                    <Typography variant="caption" color={colors.textSecondary}>
                        Your own title, date, and recurrence
                    </Typography>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
        </View>
    );

    const renderTemplatePicker = () => (
        <View style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Pressable onPress={() => onBack ? onBack() : setMode('select')} style={{ padding: 4 }}>
                    <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
                </Pressable>
                <Typography variant="h2">{contactName ? `Add ${contactName} to Group` : 'Celebration Groups'}</Typography>
            </View>
            <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.sm }}>
                Select a group celebration to add {contactName || 'this contact'} to.
            </Typography>

            {isTemplatesLoading ? (
                <View style={{ padding: spacing.xl * 2, alignItems: 'center' }}>
                    <ActivityIndicator color={colors.primary} size="large" />
                </View>
            ) : templates.length === 0 ? (
                <View style={{ padding: spacing.xl, alignItems: 'center', gap: 12 }}>
                    <Ionicons name="calendar-outline" size={40} color={colors.textMuted} />
                    <Typography variant="body" color={colors.textSecondary} align="center">
                        No templates available yet.{'\n'}Try creating a custom occasion instead.
                    </Typography>
                    <Button
                        title="Create Custom"
                        variant="outline"
                        size="sm"
                        onPress={() => {
                            setSelectedTemplate(null);
                            setTitle('');
                            setRecurrenceType('NONE');
                            setMode('custom');
                        }}
                    />
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: 12,
                        paddingBottom: spacing.xl
                    }}
                >
                    {templates.map((tmpl) => {
                        const isSelected = selectedTemplate?.id === tmpl.id;
                        return (
                            <Pressable
                                key={tmpl.id}
                                onPress={() => handleSelectTemplate(tmpl)}
                                style={[
                                    styles.templateCard,
                                    {
                                        backgroundColor: isSelected ? colors.primary + '10' : colors.surfaceRaised,
                                        borderColor: isSelected ? colors.primary : colors.border,
                                        // borderWidth: 1,
                                    }
                                ]}
                            >
                                <View style={[styles.templateIcon, { backgroundColor: colors.primary + '15' }]}>
                                    <Ionicons name="gift-outline" size={20} color={colors.primary} />
                                </View>
                                <View style={{ flex: 1, width: '100%' }}>
                                    <Typography variant="bodyBold" numberOfLines={1}>{tmpl.title}</Typography>
                                    <Typography variant="caption" color={colors.textSecondary}>
                                        {new Date(new Date().getFullYear(), tmpl.month - 1, tmpl.day).toLocaleString('default', { month: 'long', day: 'numeric' })}
                                    </Typography>
                                </View>
                                {(fixedContactId || selectedContactId) ? (
                                    <Button
                                        title="Add"
                                        size="sm"
                                        variant="primary"
                                        onPress={() => handleSubscribe(tmpl)}
                                        isLoading={isSubmitting && submittingTemplateId === tmpl.id}
                                        leftIcon={<Ionicons name="add" size={16} color={colors.surface} />}
                                    />
                                ) : isSelected && (
                                    <View style={{ position: 'absolute', top: 10, right: 10 }}>
                                        <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                                    </View>
                                )}
                            </Pressable>
                        );
                    })}
                </ScrollView>
            )}
        </View>
    );

    const renderForm = () => (
        <View style={{ paddingBottom: spacing.xl * 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing.xs }}>
                {!isEditing && (
                    <Pressable onPress={() => onBack ? onBack() : (selectedTemplate ? setSelectedTemplate(null) : setMode('select'))} style={{ padding: 4 }}>
                        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
                    </Pressable>
                )}
                <Typography variant="h2">
                    {isEditing ? 'Edit Occasion' : selectedTemplate ? selectedTemplate.title : 'Custom Occasion'}
                </Typography>
            </View>
            {!isEditing && (
                <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
                    {selectedTemplate
                        ? 'Template selected. Link a contact and confirm.'
                        : 'Add a custom occasion. This costs 1 coin.'}
                </Typography>
            )}

            {isFetchingOccasion ? (
                <View style={{ padding: spacing.xl * 2, alignItems: 'center' }}>
                    <ActivityIndicator color={colors.primary} size="large" />
                </View>
            ) : (
                <View style={styles.form}>
                    {(fixedContactId || isEditing) ? (
                        <View style={{ marginBottom: spacing.md, padding: spacing.md, backgroundColor: colors.surfaceRaised, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <Ionicons name="person-circle-outline" size={24} color={colors.primary} />
                            <View>
                                <Typography variant="bodyBold">{contactName}</Typography>
                                <Typography variant="caption" color={colors.textSecondary}>
                                    {isEditing ? 'Contact for this occasion' : 'Adding occasion for this contact'}
                                </Typography>
                            </View>
                        </View>
                    ) : (
                        <Pressable onPress={handlePickContact}>
                            <View pointerEvents="none">
                                <Input
                                    label="Contact (Optional)"
                                    placeholder="Link to a contact"
                                    value={contactName ? (contactNumber ? `${contactName} - ${contactNumber}` : contactName) : ""}
                                    isBottomSheet
                                    editable={false}
                                    rightIcon={
                                        <Pressable onPress={handlePickContact} style={{ padding: 4 }}>
                                            <Ionicons
                                                name={selectedContactId ? "checkmark-circle" : "person-add-outline"}
                                                size={20}
                                                color={selectedContactId ? colors.success : colors.textSecondary}
                                            />
                                        </Pressable>
                                    }
                                />
                            </View>
                        </Pressable>
                    )}

                    {selectedTemplate ? (
                        <View style={{ padding: spacing.md, backgroundColor: colors.surfaceRaised, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <Ionicons name="pricetag-outline" size={20} color={colors.primary} />
                            <View>
                                <Typography variant="bodyBold">{title}</Typography>
                                <Typography variant="caption" color={colors.textSecondary}>From template</Typography>
                            </View>
                        </View>
                    ) : (
                        <Input
                            label="Occasion Title"
                            placeholder="e.g. Our 10th Anniversary"
                            value={title}
                            onChangeText={setTitle}
                            isBottomSheet
                        />
                    )}

                    <Pressable onPress={() => setShowPicker(true)}>
                        <View pointerEvents="none">
                            <Input
                                label="Date"
                                placeholder="Select a date"
                                value={formattedDate}
                                onChangeText={() => { }}
                                isBottomSheet
                            />
                        </View>
                    </Pressable>

                    {showPicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleDateChange}
                        />
                    )}

                    <View>
                        <Typography variant="label" style={{ marginBottom: 8, marginLeft: 4 }}>Recurrence</Typography>
                        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                            {RECURRENCE_OPTIONS.map((opt) => (
                                <Pressable
                                    key={opt.value}
                                    onPress={() => setRecurrenceType(opt.value)}
                                    style={[
                                        styles.typeBtn,
                                        {
                                            backgroundColor: recurrenceType === opt.value ? colors.primary : colors.surfaceRaised,
                                            borderColor: recurrenceType === opt.value ? colors.primary : colors.border,
                                            borderWidth: 1,
                                        }
                                    ]}
                                >
                                    <Typography variant="caption" color={recurrenceType === opt.value ? '#FFFFFF' : colors.textPrimary}>
                                        {opt.label}
                                    </Typography>
                                </Pressable>
                            ))}
                        </View>
                    </View>



                    <Button
                        title={isEditing ? 'Save Changes' : 'Create Occasion (1 Coin)'}
                        onPress={handleSubmit}
                        disabled={!title || isSubmitting || externalLoading || isFetchingOccasion}
                        isLoading={isSubmitting || externalLoading || isFetchingOccasion}
                        style={{ marginTop: spacing.md }}
                    />
                </View>
            )}
        </View>
    );

    return (
        <View>
            {mode === 'select' && !isEditing && renderModeSelector()}
            {mode === 'template' && !selectedTemplate && !isEditing && renderTemplatePicker()}
            {(mode === 'custom' || selectedTemplate || isEditing) && renderForm()}
        </View>
    );
};

const styles = StyleSheet.create({
    form: {
        gap: 20,
    },
    typeBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    modeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 14,
        borderWidth: 1,
    },
    modeIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    templateCard: {
        width: '48%', // Adjusted for 2-column grid with gap
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 14,
        borderRadius: 14,
        gap: 10,
    },
    templateIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default OccasionForm;
