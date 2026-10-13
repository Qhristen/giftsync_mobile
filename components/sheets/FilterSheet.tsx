import { useTheme } from '@/hooks/useTheme';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Tick01Icon } from '@hugeicons/core-free-icons';
import React, { forwardRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Button from '../ui/Button';
import Typography from '../ui/Typography';

export interface FilterOptions {
    priceRange: string;
    sortBy: string;
}

interface FilterSheetProps {
    initialFilters?: FilterOptions;
    onApply: (filters: FilterOptions) => void;
}

const FilterSheet = forwardRef<BottomSheetRef, FilterSheetProps>(({ initialFilters, onApply }, ref) => {
    const { colors, spacing } = useTheme();
    const [priceRange, setPriceRange] = useState(initialFilters?.priceRange || 'All');
    const [sortBy, setSortBy] = useState(initialFilters?.sortBy || 'Trending');

    const sorts = ['Trending', 'Price: Low to High', 'Price: High to Low', 'Newest'];

    return (
        <BottomSheetWrapper ref={ref} snapPoints={['60%']}>
            <View style={{ marginBottom: spacing.xl, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View><Typography variant="caption" color={colors.textSecondary} style={{ fontFamily: 'DMSans_700Bold', letterSpacing: 1 }}>SHOP LENS</Typography><Typography variant="h2">Sort the shelves</Typography></View>
                <Pressable onPress={() => {
                    setPriceRange('All');
                    setSortBy('Trending');
                }} style={{ backgroundColor: colors.lemon, borderColor: colors.ink, borderWidth: 1.25, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 }}>
                    <Typography variant="caption" style={{ fontWeight: '800' }}>RESET</Typography>
                </Pressable>
            </View>

            {/* <Typography variant="h4" style={{ marginBottom: spacing.md }}>Price Range</Typography> */}
            {/* <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: spacing.xl }}>
                {prices.map((p) => {
                    const isSelected = priceRange === p;
                    return (
                        <Pressable
                            key={p}
                            onPress={() => setPriceRange(p)}
                            style={[
                                styles.pill,
                                {
                                    backgroundColor: isSelected ? colors.primary : colors.surfaceRaised,
                                    borderColor: isSelected ? colors.primary : colors.border
                                }
                            ]}
                        >
                            <Typography variant="body" color={isSelected ? '#FFF' : colors.textPrimary}>{p}</Typography>
                        </Pressable>
                    );
                })}
            </View> */}

            <Typography variant="h4" style={{ marginBottom: spacing.md }}>Sort By</Typography>
            <View style={{ gap: 12, marginBottom: spacing.xl }}>
                {sorts.map((s, index) => {
                    const isSelected = sortBy === s;
                    return (
                        <Pressable
                            key={s}
                            onPress={() => setSortBy(s)}
                            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: [colors.lemon, colors.lavender, colors.mint, colors.peach][index], borderColor: colors.ink, borderWidth: 1.25, borderRadius: 16, shadowColor: isSelected ? colors.ink : 'transparent', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0 }}
                        >
                            <Typography variant="body" color={colors.textPrimary}>{s}</Typography>
                            {isSelected && <HugeiconsIcon icon={Tick01Icon} size={20} color={colors.ink} />}
                        </Pressable>
                    );
                })}
            </View>

            <Button title="Use this shop lens  →" onPress={() => {
                onApply({ priceRange, sortBy });
                (ref as any)?.current?.close();
            }} style={{ marginTop: 'auto' }} />
        </BottomSheetWrapper>
    );
});

FilterSheet.displayName = 'FilterSheet';

export default FilterSheet;
