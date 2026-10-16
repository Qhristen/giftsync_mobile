import EventPickerSheet from '@/components/sheets/EventPickerSheet';
import VendorDetailSheet from '@/components/sheets/VendorDetailSheet';
import ShopItemDetailSkeleton from '@/components/skeletons/ShopItemDetailSkeleton';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useTheme } from '@/hooks/useTheme';
import { useGetUpcomingEventsQuery } from '@/store/api/event';
import { useGetProductByIdQuery } from '@/store/api/productApi';
import { Event } from '@/types';
import { calculateDeliveryStatus } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/formatCurrency';
import {
    Alert01Icon,
    ArrowLeft01Icon,
    ArrowRight01Icon,
    BoxIcon,
    DeliveryTruck02Icon,
    GiftIcon,
    Image01Icon,
    Tag01Icon,
    Time02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const earthRadius = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
    return earthRadius * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function ProductDetailScreen() {
    const { id, occasionId, eventId } = useLocalSearchParams<{ id: string; occasionId?: string; eventId?: string }>();
    const selectedEventId = occasionId || eventId;
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();
    const [activeIndex, setActiveIndex] = useState(0);
    const [descriptionExpanded, setDescriptionExpanded] = useState(false);
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
    const occasionSheet = useBottomSheet();
    const vendorSheet = useBottomSheet();
    const { data: upcomingEvents = [] } = useGetUpcomingEventsQuery();
    const { data: product, isLoading, isFetching, error } = useGetProductByIdQuery(id);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            setUserLocation(await Location.getCurrentPositionAsync({}));
        })();
    }, []);

    const selectedEvent = useMemo(
        () => selectedEventId ? upcomingEvents.find((event) => event.id === selectedEventId) : null,
        [selectedEventId, upcomingEvents],
    );

    const deliveryStatus = useMemo(() => {
        if (!product || !selectedEvent) return null;
        return calculateDeliveryStatus(selectedEvent.date, product.deliveryDays, selectedEvent.contact?.name);
    }, [product, selectedEvent]);

    const businessLocationCoords = useMemo(() => {
        if (!product?.business?.location) return null;
        const [latitude, longitude] = product.business.location.split(',').map(Number);
        return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null;
    }, [product?.business?.location]);

    const toggleDescription = useCallback(() => setDescriptionExpanded((value) => !value), []);

    if (isLoading || isFetching) return <ShopItemDetailSkeleton />;

    if (error || !product) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: colors.background, padding: spacing.xl }]}>
                <Typography variant="h2">This gift slipped away.</Typography>
                <Typography variant="body" color={colors.textSecondary} align="center">It may no longer be available in the shop.</Typography>
                <Button title="Back to the shop" onPress={() => router.back()} />
            </View>
        );
    }

    const totalPrice = Number(product.price) + Number(product.deliveryFee) + Number(product.packagingFee);
    const paperColors = [colors.lemon, colors.mint, colors.lilac];

    const startCheckout = () => {
        if (selectedEventId) {
            router.push({ pathname: '/checkout', params: { productId: id, occasionId: selectedEventId } });
        } else {
            occasionSheet.open();
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.fixedHeader, { paddingTop: insets.top + 10, paddingHorizontal: spacing.xl, backgroundColor: colors.background }]}>
                <Pressable onPress={() => router.back()} style={[styles.headerButton, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={22} color={colors.ink} />
                </Pressable>
                <View style={[styles.catalogLabel, { backgroundColor: colors.accent, borderColor: colors.ink }]}>
                    <Typography variant="caption" color="#17151D" style={styles.overline}>GIFT CATALOGUE</Typography>
                </View>
            </View>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 18, paddingBottom: 126 }}>
                <View>
                    <View style={styles.galleryFrame}>
                        {product.imageUrls?.length ? (
                            <FlashList
                                data={product.imageUrls}
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(_, index) => index.toString()}
                                onMomentumScrollEnd={(event) => setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / width))}
                                renderItem={({ item, index }) => (
                                    <View style={{ width, paddingHorizontal: spacing.xl }}>
                                        <View style={[styles.imagePaper, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                            <Image source={{ uri: item }} style={styles.heroImage} contentFit="cover" />
                                            <View style={[styles.imageTape, { backgroundColor: paperColors[index % paperColors.length], borderColor: colors.ink }]} />
                                        </View>
                                    </View>
                                )}
                            />
                        ) : (
                            <View style={{ paddingHorizontal: spacing.xl }}>
                                <View style={[styles.imagePaper, styles.center, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                    <HugeiconsIcon icon={Image01Icon} size={48} color={colors.textMuted} />
                                </View>
                            </View>
                        )}
                        {(product.imageUrls?.length || 0) > 1 && (
                            <View style={[styles.pagination, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                {product.imageUrls.map((_, index) => (
                                    <View key={index} style={[styles.dot, { backgroundColor: index === activeIndex ? colors.ink : colors.textMuted }, index === activeIndex && styles.activeDot]} />
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                <View style={{ paddingHorizontal: spacing.xl, marginTop: 26 }}>
                    <View style={styles.titleBlock}>
                        <View style={{ flex: 1 }}>
                            <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>{product.category?.name?.toUpperCase() || 'A SPECIAL FIND'}</Typography>
                            <Typography variant="h1" style={styles.productTitle}>{product.name}</Typography>
                        </View>
                        <View style={[styles.priceTicket, { backgroundColor: colors.lemon, borderColor: colors.ink }]}>
                            <View style={[styles.ticketHole, { backgroundColor: colors.background, borderColor: colors.ink }]} />
                            <Typography variant="caption" style={styles.overline}>TOTAL</Typography>
                            <Typography variant="h3">{formatCurrency(totalPrice, product.currency)}</Typography>
                        </View>
                    </View>

                    <Pressable
                        onPress={vendorSheet.open}
                        style={({ pressed }) => [styles.makerStrip, { backgroundColor: colors.mint, borderColor: colors.ink }, pressed && styles.pressed]}
                    >
                        <Avatar name={product.business?.name || 'Maker'} uri={product.business?.logoUrl} size={48} style={{ borderWidth: 1.5, borderColor: colors.ink }} />
                        <View style={{ flex: 1 }}>
                            <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>MEET THE MAKER</Typography>
                            <Typography variant="bodyBold">{product.business?.name || 'GiftSync maker'}</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>{product.ratingCount || 0} customer reviews</Typography>
                        </View>
                        <HugeiconsIcon icon={ArrowRight01Icon} size={21} color={colors.ink} />
                    </Pressable>

                    {deliveryStatus && (
                        <View style={[styles.deliveryNote, { backgroundColor: deliveryStatus.canArriveOnTime ? colors.mint : colors.peach, borderColor: colors.ink }]}>
                            <View style={[styles.noteIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                <HugeiconsIcon icon={deliveryStatus.canArriveOnTime ? Time02Icon : Alert01Icon} size={22} color={deliveryStatus.canArriveOnTime ? colors.success : colors.error} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Typography variant="bodyBold">{deliveryStatus.canArriveOnTime ? 'Perfect timing' : 'A close call'}</Typography>
                                <Typography variant="caption" color={colors.textSecondary}>Arrival {deliveryStatus.arrivalDate} · the occasion is in {deliveryStatus.daysToEvent} days.</Typography>
                            </View>
                        </View>
                    )}

                    <View style={styles.factBento}>
                        <FactTile icon={BoxIcon} label="Availability" value={product.isAvailable ? 'In stock' : 'Sold out'} color={colors.lilac} />
                        <FactTile icon={DeliveryTruck02Icon} label="Delivery" value={`${product.deliveryDays} ${product.deliveryDays === 1 ? 'day' : 'days'}`} color={colors.peach} />
                        <FactTile icon={Tag01Icon} label="Item" value={formatCurrency(product.price, product.currency)} color={colors.lemon} wide />
                    </View>

                    {product.description && (
                        <View style={[styles.storyCard, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                            <View style={styles.storyHeading}>
                                <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>THE STORY</Typography>
                                <View style={[styles.storyLine, { backgroundColor: colors.ink }]} />
                            </View>
                            <Typography variant="body" color={colors.textSecondary} numberOfLines={descriptionExpanded ? undefined : 5}>{product.description}</Typography>
                            <Pressable onPress={toggleDescription} style={[styles.readButton, { borderColor: colors.ink }]}>
                                <Typography variant="caption" style={styles.overline}>{descriptionExpanded ? 'FOLD STORY' : 'READ FULL STORY'}</Typography>
                            </Pressable>
                        </View>
                    )}

                    {!!product.tags?.length && (
                        <View style={{ marginTop: 26 }}>
                            <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>DETAIL TAGS</Typography>
                            <View style={styles.tags}>
                                {product.tags.map((tag, index) => (
                                    <View key={`${tag}-${index}`} style={[styles.tag, { backgroundColor: paperColors[index % paperColors.length], borderColor: colors.ink }]}>
                                        <Typography variant="caption" style={{ fontFamily: 'DMSans_700Bold' }}>#{tag}</Typography>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {businessLocationCoords && (
                        <View style={[styles.mapCard, { backgroundColor: colors.sky, borderColor: colors.ink }]}>
                            <View style={styles.mapHeading}>
                                <View style={{ flex: 1 }}>
                                    <Typography variant="caption" style={styles.overline}>MADE NEARBY</Typography>
                                    <Typography variant="h4">{product.business?.name}&apos;s studio</Typography>
                                </View>
                                {userLocation && (
                                    <Typography variant="caption" style={styles.distancePill}>
                                        {getDistance(userLocation.coords.latitude, userLocation.coords.longitude, businessLocationCoords.latitude, businessLocationCoords.longitude).toFixed(1)} km
                                    </Typography>
                                )}
                            </View>
                            <View style={[styles.mapFrame, { borderColor: colors.ink }]}>
                                <MapView
                                    style={{ flex: 1 }}
                                    provider={PROVIDER_GOOGLE}
                                    region={{ ...businessLocationCoords, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
                                >
                                    <Marker coordinate={businessLocationCoords} title={product.business?.name || 'Local maker'} />
                                </MapView>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: colors.background, borderTopColor: colors.ink }]}>
                <View>
                    <Typography variant="caption" color={colors.textSecondary}>READY TO WRAP</Typography>
                    <Typography variant="bodyBold">{formatCurrency(totalPrice, product.currency)}</Typography>
                </View>
                <Button title="Send this gift" onPress={startCheckout} leftIcon={<HugeiconsIcon icon={GiftIcon} size={19} color="#17151D" />} style={styles.sendButton} />
            </View>

            <EventPickerSheet
                ref={occasionSheet.ref}
                events={upcomingEvents}
                onSelect={(event: Event) => {
                    occasionSheet.close();
                    router.push({ pathname: '/checkout', params: { productId: id, occasionId: event.id } });
                }}
            />
            <VendorDetailSheet ref={vendorSheet.ref} business={product.business} ratingAvg={product.ratingAvg} ratingCount={product.ratingCount} />
        </View>
    );
}

function FactTile({ icon, label, value, color, wide = false }: { icon: any; label: string; value: string; color: string; wide?: boolean }) {
    const { colors } = useTheme();
    return (
        <View style={[styles.factTile, wide && styles.factTileWide, { backgroundColor: color, borderColor: colors.ink }]}>
            <View style={[styles.factIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                <HugeiconsIcon icon={icon} size={19} color={colors.ink} />
            </View>
            <View style={{ flex: 1 }}>
                <Typography variant="caption" color={colors.textSecondary}>{label.toUpperCase()}</Typography>
                <Typography variant="bodyBold" numberOfLines={1}>{value}</Typography>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { alignItems: 'center', justifyContent: 'center', gap: 12 },
    scroll: { flex: 1 },
    fixedHeader: { zIndex: 10, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerButton: { width: 44, height: 44, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', },
    catalogLabel: { height: 36, borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '2deg' }] },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: 0.8 },
    galleryFrame: { minHeight: 398 },
    imagePaper: { height: 380, borderRadius: 14, borderWidth: 1.5, padding: 9, },
    heroImage: { width: '100%', height: '100%', borderRadius: 8, borderWidth: 1, borderColor: '#17151D' },
    imageTape: { position: 'absolute', width: 58, height: 15, top: -8, left: '42%', borderWidth: 1, transform: [{ rotate: '-3deg' }] },
    pagination: { position: 'absolute', bottom: 0, alignSelf: 'center', flexDirection: 'row', gap: 5, paddingHorizontal: 9, paddingVertical: 6, borderWidth: 1.25, borderRadius: 12 },
    dot: { width: 6, height: 6, borderRadius: 3 },
    activeDot: { width: 16 },
    titleBlock: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    productTitle: { fontSize: 36, lineHeight: 41, marginTop: 2 },
    priceTicket: { minWidth: 122, minHeight: 82, borderWidth: 1.5, borderRadius: 16, padding: 12, justifyContent: 'center', transform: [{ rotate: '3deg' }] },
    ticketHole: { position: 'absolute', width: 12, height: 12, borderRadius: 6, borderWidth: 1, left: -7, top: 34 },
    makerStrip: { marginTop: 22, borderWidth: 1.5, borderRadius: 20, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12 },
    deliveryNote: { marginTop: 18, borderWidth: 1.5, borderRadius: 19, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, },
    noteIcon: { width: 44, height: 44, borderWidth: 1.25, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    factBento: { marginTop: 24, flexDirection: 'row', flexWrap: 'wrap', gap: 11 },
    factTile: { width: '48.3%', minHeight: 118, borderWidth: 1.5, borderRadius: 20, padding: 13, justifyContent: 'space-between' },
    factTileWide: { width: '100%', minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: 11 },
    factIcon: { width: 38, height: 38, borderRadius: 12, borderWidth: 1.25, alignItems: 'center', justifyContent: 'center' },
    storyCard: { marginTop: 26, borderWidth: 1.5, borderRadius: 22, padding: 18, gap: 12, },
    storyHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    storyLine: { flex: 1, height: 1 },
    readButton: { alignSelf: 'flex-start', borderWidth: 1.25, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
    tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
    tag: { borderWidth: 1.25, borderRadius: 11, paddingHorizontal: 10, paddingVertical: 7 },
    mapCard: { marginTop: 28, borderWidth: 1.5, borderRadius: 22, padding: 14, },
    mapHeading: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    distancePill: { backgroundColor: '#FFFEFB', overflow: 'hidden', borderRadius: 9, paddingHorizontal: 8, paddingVertical: 4 },
    mapFrame: { height: 130, borderWidth: 1.5, borderRadius: 14, overflow: 'hidden' },
    footer: { position: 'absolute', bottom: 0, width: '100%', minHeight: 86, paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
    sendButton: { minWidth: 190 },
    pressed: { opacity: 0.85, transform: [{ translateY: 2 }] },
});
