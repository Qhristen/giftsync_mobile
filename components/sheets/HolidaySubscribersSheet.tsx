import Avatar from '@/components/ui/Avatar';
import BottomSheetWrapper, { BottomSheetRef } from '@/components/ui/BottomSheetWrapper';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Typography from '@/components/ui/Typography';
import { usePlatformConfig } from '@/hooks/usePlatformConfig';
import { useTheme } from '@/hooks/useTheme';
import { OccasionTemplate } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetFlatList, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as Contacts from 'expo-contacts';
import { useRouter } from 'expo-router';
import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
    holiday: OccasionTemplate | null;
}

const HolidaySubscribersSheet = forwardRef<BottomSheetRef, Props>(({ holiday }, ref) => {
    const { colors, spacing } = useTheme();
    const router = useRouter();
    const sheetRef = useRef<BottomSheetRef>(null);
    const { directSmsCost } = usePlatformConfig();
    const [localContacts, setLocalContacts] = useState<(Contacts.Contact & { id: string })[]>([]);
    const [isLoadingContacts, setIsLoadingContacts] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [pageOffset, setPageOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const insets = useSafeAreaInsets();
    const [selectedContactsMap, setSelectedContactsMap] = useState<Map<string, Contacts.Contact & { id: string }>>(new Map());

    // New states for search and AI generation
    const [searchQuery, setSearchQuery] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const latestQueryRef = useRef('');
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const fetchContacts = useCallback(async (query: string = '', offset: number = 0, append: boolean = false) => {
        if (append) setIsLoadingMore(true);
        else setIsLoadingContacts(true);

        try {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status === 'granted') {
                const { data, hasNextPage } = await Contacts.getContactsAsync({
                    fields: [Contacts.Fields.PhoneNumbers],
                    sort: Contacts.SortTypes.FirstName,
                    name: query || undefined,
                    pageSize: 20,
                    pageOffset: offset,
                });

                if (latestQueryRef.current === query) {
                    const validContacts = data.filter(c => c.phoneNumbers && c.phoneNumbers.length > 0) as (Contacts.Contact & { id: string })[];

                    setLocalContacts(prev => {
                        if (!append) return validContacts;

                        // Prevent duplicate keys by filtering out contacts already in the list
                        const existingIds = new Set(prev.map(c => c.id));
                        const uniqueNew = validContacts.filter(c => !existingIds.has(c.id));
                        return [...prev, ...uniqueNew];
                    });

                    setHasMore(hasNextPage);
                    setPageOffset(offset);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            if (append) setIsLoadingMore(false);
            else setIsLoadingContacts(false);
        }
    }, []);

    const handleSearch = useCallback((text: string) => {
        setSearchQuery(text);
        latestQueryRef.current = text;

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            fetchContacts(text, 0, false);
        }, 300);
    }, [fetchContacts]);

    useImperativeHandle(ref, () => ({
        expand: () => {
            handleSearch('');
            sheetRef.current?.expand();
        },
        close: () => sheetRef.current?.close(),
        snapToIndex: (index: number) => {
            handleSearch('');
            sheetRef.current?.snapToIndex(index);
        },
        present: () => {
            handleSearch('');
            sheetRef.current?.present();
        },
        dismiss: () => sheetRef.current?.dismiss(),
    }), [handleSearch]);

    const handleGenerateMessages = async () => {
        setIsGenerating(true);
        const selected = Array.from(selectedContactsMap.values());

        try {
            const contactsList = selected.map(c => `(${c.phoneNumbers?.[0]?.number || 'No number'})`).join(', ');

            const prompt = `Please write and send a unique, short, casual ${holiday?.title || 'Holiday'} SMS message to the following contacts: ${contactsList}`;

            setSelectedContactsMap(new Map());
            sheetRef.current?.close();

            router.push({
                pathname: '/ai-chat',
                params: { initialMessage: prompt }
            });
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleContact = useCallback((contact: Contacts.Contact & { id: string }) => {
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

    const renderItem = useCallback(({ item }: { item: Contacts.Contact & { id: string } }) => {
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
                        {item.phoneNumbers?.[0]?.number}
                    </Typography>
                </View>
                <View style={[
                    styles.checkbox,
                    {
                        borderColor: isSelected ? colors.primary : colors.border,
                        backgroundColor: isSelected ? colors.primary : 'transparent'
                    }
                ]}>
                    {isSelected && <Ionicons name="checkmark" size={14} color="#FFF" />}
                </View>
            </TouchableOpacity>
        );
    }, [colors, selectedContactsMap, toggleContact]);

    return (
        <BottomSheetWrapper
            ref={sheetRef}
            snapPoints={['75%']}
            scrollable={false}
            disablePadding
            enableFlex
            renderFooter={() => (
                <View style={[{ paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: insets.bottom + 20, backgroundColor: colors.surface }]}>
                    <Button
                        title={isGenerating ? "Sending..." : `Send Messages (${selectedContactsMap.size}) (${Number(directSmsCost * selectedContactsMap.size).toFixed(1) ?? 0} coins)`}
                        variant="primary"
                        size="md"
                        leftIcon={isGenerating ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="sparkles" size={18} color="#FFF" />}
                        style={{ flex: 1 }}
                        onPress={handleGenerateMessages}
                        disabled={selectedContactsMap.size === 0 || isGenerating}
                    />
                </View>
            )}
        >
            {!holiday ? (
                <View style={{ height: 100 }} />
            ) : (
                <View style={[styles.container, { paddingHorizontal: spacing.none }]}>
                    <BottomSheetFlatList
                        data={localContacts}
                        style={{ flex: 1 }}
                        renderItem={renderItem}
                        keyExtractor={(item: Contacts.Contact & { id: string }) => item.id}
                        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 20 }}
                        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                        ListHeaderComponent={
                            <View>
                                <View style={[styles.header, { paddingHorizontal: spacing.none, marginTop: spacing.md }]}>
                                    <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                                        <Ionicons name="gift-outline" size={32} color={colors.primary} />
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
                                        isBottomSheet
                                        leftIcon={<Ionicons name="search" size={20} color={colors.textSecondary} />}
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
                                    <Ionicons name="search" size={48} color={colors.textSecondary} style={{ opacity: 0.3 }} />
                                    <Typography variant="body" color={colors.textSecondary} align="center">
                                        {searchQuery ? `No contacts found matching "${searchQuery}".` : 'No contacts found.'}
                                    </Typography>
                                </View>
                            ) : null
                        }
                        onEndReached={() => {
                            if (hasMore && !isLoadingMore && !isLoadingContacts) {
                                fetchContacts(searchQuery, pageOffset + 20, true);
                            }
                        }}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={isLoadingMore ? <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} /> : null}
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
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 20,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    subscriberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        gap: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        gap: 12,
    }
});

HolidaySubscribersSheet.displayName = 'HolidaySubscribersSheet';

export default HolidaySubscribersSheet;
