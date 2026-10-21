import Avatar from '@/components/ui/Avatar';
import BottomSheetWrapper, { BottomSheetRef } from '@/components/ui/BottomSheetWrapper';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Typography from '@/components/ui/Typography';
import { useDebounce } from '@/hooks/useDebounce';
import { usePlatformConfig } from '@/hooks/usePlatformConfig';
import { useTheme } from '@/hooks/useTheme';
import { useCreateEventMutation } from '@/store/api/event';
import { walletApi } from '@/store/api/walletApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { adjustCoinBalance, setCoinBalance } from '@/store/slices/authSlice';
import { EventTemplate } from '@/types';
import { normalizeNigerianPhoneNumber } from '@/utils/phone';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    Calendar01Icon,
    GiftIcon,
    Search01Icon,
    Tick01Icon,
} from '@hugeicons/core-free-icons';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { format } from 'date-fns';
import * as Contacts from "expo-contacts/legacy";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import { moderateScale } from '@/utils/scaling';

interface Props {
    holiday: EventTemplate | null;
}

type PhoneContact = Contacts.Contact & { id: string };

const getContactPhoneNumber = (contact: Contacts.Contact) => {
    for (const phoneNumber of contact.phoneNumbers || []) {
        const normalized = normalizeNigerianPhoneNumber(phoneNumber.number);
        if (normalized) return normalized;
    }

    return null;
};

const HolidaySubscribersSheet = forwardRef<BottomSheetRef, Props>(({ holiday }, ref) => {
    const { colors, spacing } = useTheme();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const sheetRef = useRef<BottomSheetRef>(null);
    const { occasionCreationCost } = usePlatformConfig();
    const [createEvent] = useCreateEventMutation();
    const [localContacts, setLocalContacts] = useState<PhoneContact[]>([]);
    const [isLoadingContacts, setIsLoadingContacts] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [pageOffset, setPageOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const insets = useSafeAreaInsets();
    const [selectedContactsMap, setSelectedContactsMap] = useState<Map<string, PhoneContact>>(new Map());

    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery.trim(), 400);
    const [isSheetPresented, setIsSheetPresented] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const latestQueryRef = useRef('');
    const contactsPermissionGrantedRef = useRef(false);
    const searchRequestIdRef = useRef(0);

    const fetchContacts = useCallback(async (query: string = '', offset: number = 0, append: boolean = false) => {
        const requestId = append ? null : ++searchRequestIdRef.current;
        if (append) setIsLoadingMore(true);
        else setIsLoadingContacts(true);

        try {
            if (!contactsPermissionGrantedRef.current) {
                const { status } = await Contacts.requestPermissionsAsync();
                contactsPermissionGrantedRef.current = status === 'granted';
            }

            if (!contactsPermissionGrantedRef.current) return;

            const { data, hasNextPage } = await Contacts.getContactsAsync({
                fields: [Contacts.Fields.PhoneNumbers],
                sort: Contacts.SortTypes.FirstName,
                name: query || undefined,
                pageSize: 20,
                pageOffset: offset,
            });

            if (latestQueryRef.current !== query) return;

            const validContacts = data.filter(c => c.phoneNumbers && c.phoneNumbers.length > 0) as PhoneContact[];

            setLocalContacts(prev => {
                if (!append) return validContacts;

                // Prevent duplicate keys by filtering out contacts already in the list
                const existingIds = new Set(prev.map(c => c.id));
                const uniqueNew = validContacts.filter(c => !existingIds.has(c.id));
                return [...prev, ...uniqueNew];
            });

            setHasMore(hasNextPage);
            setPageOffset(offset);
        } catch (e) {
            console.error(e);
        } finally {
            if (append) setIsLoadingMore(false);
            else if (requestId === searchRequestIdRef.current) setIsLoadingContacts(false);
        }
    }, []);

    const handleSearch = useCallback((text: string) => {
        setSearchQuery(text);
        latestQueryRef.current = text.trim();
    }, []);

    useEffect(() => {
        if (!isSheetPresented || searchQuery.trim() !== debouncedSearchQuery) return;
        void fetchContacts(debouncedSearchQuery, 0, false);
    }, [debouncedSearchQuery, fetchContacts, isSheetPresented, searchQuery]);

    const prepareSheet = useCallback(() => {
        latestQueryRef.current = '';
        setSearchQuery('');
        setIsSheetPresented(true);
    }, []);

    const handleSheetClose = useCallback(() => {
        setIsSheetPresented(false);
    }, []);

    useImperativeHandle(ref, () => ({
        expand: () => {
            prepareSheet();
            sheetRef.current?.expand();
        },
        close: () => sheetRef.current?.close(),
        snapToIndex: (index: number) => {
            prepareSheet();
            sheetRef.current?.snapToIndex(index);
        },
        present: () => {
            prepareSheet();
            sheetRef.current?.present();
        },
        dismiss: () => sheetRef.current?.dismiss(),
    }), [prepareSheet]);

    const handleCreateEvents = useCallback(async () => {
        if (!holiday || selectedContactsMap.size === 0 || isCreating) return;

        const selected = Array.from(selectedContactsMap.values());
        const contactsToCreate = selected.map(contact => ({
            contact,
            phoneNumber: getContactPhoneNumber(contact),
        }));
        const invalidContacts = contactsToCreate.filter(({ phoneNumber }) => !phoneNumber);

        if (invalidContacts.length > 0) {
            const firstInvalidName = invalidContacts[0].contact.name || 'The selected contact';
            toast.error('Invalid phone number', {
                description: invalidContacts.length === 1
                    ? `${firstInvalidName} needs a valid Nigerian phone number before an event can be added.`
                    : `${invalidContacts.length} selected contacts need valid Nigerian phone numbers.`,
            });
            return;
        }

        const costPerEvent = Number(occasionCreationCost || 0);
        const optimisticCost = costPerEvent * contactsToCreate.length;
        const balanceBeforeSubmit = user?.coinBalance ?? 0;
        if (balanceBeforeSubmit < optimisticCost) {
            toast.error('Insufficient Balance', {
                description: `Adding these events costs ${optimisticCost} coins.`,
            });
            return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const eventDate = new Date(today.getFullYear(), holiday.month - 1, holiday.day);
        if (eventDate < today) eventDate.setFullYear(eventDate.getFullYear() + 1);

        setIsCreating(true);
        dispatch(adjustCoinBalance(-optimisticCost));
        dispatch(walletApi.util.updateQueryData('getWalletBalance', undefined, (draft) => {
            draft.balance = Math.max(0, draft.balance - optimisticCost);
        }));

        try {
            const results = await Promise.allSettled(
                contactsToCreate.map(({ contact, phoneNumber }) => createEvent({
                    title: holiday.title,
                    date: format(eventDate, 'yyyy-MM-dd'),
                    recurrenceType: 'YEARLY',
                    name: contact.name || 'Contact',
                    phoneNumber: phoneNumber!,
                }).unwrap()),
            );

            const failedContacts = selected.filter((_, index) => results[index].status === 'rejected');
            const successCount = selected.length - failedContacts.length;

            const reconciledBalance = balanceBeforeSubmit - successCount * costPerEvent;
            dispatch(setCoinBalance(reconciledBalance));
            dispatch(walletApi.util.upsertQueryData('getWalletBalance', undefined, { balance: reconciledBalance }));

            if (failedContacts.length === 0) {
                setSelectedContactsMap(new Map());
                sheetRef.current?.close();
                toast.success(`${holiday.title} added`, {
                    description: `Created ${successCount} event${successCount === 1 ? '' : 's'} for your selected contact${successCount === 1 ? '' : 's'}.`,
                });
            } else {
                setSelectedContactsMap(new Map(failedContacts.map(contact => [contact.id, contact])));
                const firstFailure = results.find(result => result.status === 'rejected');
                const failureMessage = firstFailure?.status === 'rejected'
                    ? (firstFailure.reason as { data?: { message?: string } })?.data?.message
                    : undefined;
                toast.error('Some events could not be created', {
                    description: failureMessage || `${successCount} added, ${failedContacts.length} still selected so you can retry.`,
                });
            }
        } catch (error: unknown) {
            dispatch(setCoinBalance(balanceBeforeSubmit));
            dispatch(walletApi.util.upsertQueryData('getWalletBalance', undefined, { balance: balanceBeforeSubmit }));
            const message = (error as { data?: { message?: string } })?.data?.message;
            toast.error('Could not create events', { description: message || 'Please try again.' });
        } finally {
            setIsCreating(false);
        }
    }, [createEvent, dispatch, holiday, isCreating, occasionCreationCost, selectedContactsMap, user?.coinBalance]);

    const toggleContact = useCallback((contact: PhoneContact) => {
        setSelectedContactsMap(prev => {
            const next = new Map(prev);
            if (next.has(contact.id)) {
                next.delete(contact.id);
            } else {
                next.set(contact.id, contact);
            }
            return next;
        });
    }, []);

    const renderItem = useCallback(({ item }: { item: PhoneContact }) => {
        const isSelected = selectedContactsMap.has(item.id);
        return (
            <TouchableOpacity
                key={item.id}
                style={[styles.subscriberItem, { backgroundColor: colors.surfaceRaised, borderColor: isSelected ? colors.primary : 'transparent', borderWidth: 1 }]}
                onPress={() => toggleContact(item)}
                activeOpacity={0.7}
            >
                <Avatar uri={item.imageAvailable ? item.image?.uri : undefined} name={item.name} size="md" />
                <View style={{ flex: 1 }}>
                    <Typography variant="bodyBold">{item.name}</Typography>
                    <Typography variant="caption" color={colors.textSecondary}>
                        {getContactPhoneNumber(item) || item.phoneNumbers?.[0]?.number}
                    </Typography>
                </View>
                <View style={[
                    styles.checkbox,
                    {
                        borderColor: isSelected ? colors.primary : colors.border,
                        backgroundColor: isSelected ? colors.primary : 'transparent'
                    }
                ]}>
                    {isSelected && <HugeiconsIcon icon={Tick01Icon} size={moderateScale(14)} color="#FFF" />}
                </View>
            </TouchableOpacity>
        );
    }, [colors, selectedContactsMap, toggleContact]);

    const renderFooter = useCallback(() => (
        <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: insets.bottom + moderateScale(20), backgroundColor: colors.surface }}>
            <Button
                title={isCreating
                    ? 'Adding events...'
                    : `Add Events (${selectedContactsMap.size}) (${Number(occasionCreationCost || 0) * selectedContactsMap.size} coins)`}
                variant="primary"
                size="md"
                leftIcon={isCreating ? <ActivityIndicator size="small" color="#FFF" /> : <HugeiconsIcon icon={Calendar01Icon} size={moderateScale(18)} color="#FFF" />}
                style={{ flex: 1 }}
                onPress={handleCreateEvents}
                disabled={selectedContactsMap.size === 0 || isCreating}
            />
        </View>
    ), [colors.surface, handleCreateEvents, insets.bottom, isCreating, occasionCreationCost, selectedContactsMap.size, spacing.md]);

    const isSearchPending = searchQuery.trim() !== debouncedSearchQuery;

    return (
        <BottomSheetWrapper
            ref={sheetRef}
            snapPoints={['75%']}
            scrollable={false}
            disablePadding
            enableFlex
            keyboardBehavior="interactive"
            onClose={handleSheetClose}
            renderFooter={renderFooter}
        >
            {!holiday ? (
                <View style={{ height: moderateScale(100) }} />
            ) : (
                <View style={[styles.container, { paddingHorizontal: spacing.none, }]}>
                    <BottomSheetFlatList
                        data={localContacts}
                        style={{ flex: 1 }}
                        renderItem={renderItem}
                        keyExtractor={(item: PhoneContact) => item.id}
                        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: moderateScale(100) }}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                        ItemSeparatorComponent={() => <View style={{ height: moderateScale(12) }} />}
                        ListHeaderComponent={
                            <View>
                                <View style={[styles.header, { paddingHorizontal: spacing.none, marginTop: spacing.md }]}>
                                    <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                                        <HugeiconsIcon icon={GiftIcon} size={moderateScale(32)} color={colors.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Typography variant="h2">{holiday.title}</Typography>
                                        <Typography variant="body" color={colors.textSecondary}>
                                            {holiday.description}
                                        </Typography>
                                    </View>
                                </View>

                                <View style={{ marginBottom: spacing.md }}>
                                    <Input
                                        placeholder="Search contacts..."
                                        value={searchQuery}
                                        onChangeText={handleSearch}
                                        autoCapitalize="none"
                                        isBottomSheet
                                        leftIcon={<HugeiconsIcon icon={Search01Icon} size={moderateScale(20)} color={colors.textSecondary} />}
                                    />
                                </View>

                                {isLoadingContacts && localContacts.length === 0 && (
                                    <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: spacing.xl }} />
                                )}
                            </View>
                        }
                        ListEmptyComponent={
                            !isLoadingContacts ? (
                                <View style={styles.emptyState}>
                                    <HugeiconsIcon icon={Search01Icon} size={moderateScale(48)} color={colors.textSecondary} style={{ opacity: 0.3 }} />
                                    <Typography variant="body" color={colors.textSecondary} align="center">
                                        {searchQuery ? `No contacts found matching "${searchQuery}".` : 'No contacts found.'}
                                    </Typography>
                                </View>
                            ) : null
                        }
                        onEndReached={() => {
                            if (hasMore && !isSearchPending && !isLoadingMore && !isLoadingContacts) {
                                fetchContacts(debouncedSearchQuery, pageOffset + 20, true);
                            }
                        }}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={isLoadingMore ? <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: moderateScale(12) }} /> : null}
                        extraData={selectedContactsMap}
                    />
                </View>
            )}
        </BottomSheetWrapper>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: moderateScale(20),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(16),
        marginBottom: moderateScale(20),
    },
    iconContainer: {
        width: moderateScale(64),
        height: moderateScale(64),
        borderRadius: moderateScale(20),
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionRow: {
        flexDirection: 'row',
        gap: moderateScale(12),
        marginBottom: moderateScale(8),
    },
    subscriberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: moderateScale(12),
        borderRadius: moderateScale(16),
        gap: moderateScale(12),
    },
    checkbox: {
        width: moderateScale(24),
        height: moderateScale(24),
        borderRadius: moderateScale(12),
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: moderateScale(40),
        gap: moderateScale(12),
    }
});

HolidaySubscribersSheet.displayName = 'HolidaySubscribersSheet';

export default HolidaySubscribersSheet;
