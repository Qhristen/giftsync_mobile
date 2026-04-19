import { useTheme } from '@/hooks/useTheme';
import { getCurrencySymbol } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Button from '../ui/Button';
import Typography from '../ui/Typography';
import { useAppSelector } from '@/store/hooks';

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

    const { user } = useAppSelector(s => s.auth);
    const sym = getCurrencySymbol(user?.currency || 'NGN');

    const prices = ['All', `Under ${sym}5000`, `${sym}5000 - ${sym}10000`, `Over ${sym}10000`];
    const sorts = ['Trending', 'Price: Low to High', 'Price: High to Low', 'Newest'];

    return (
        <BottomSheetWrapper ref={ref} snapPoints={['60%']}>
            <View style={{ marginBottom: spacing.xl, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h3">Filters</Typography>
                <Pressable onPress={() => {
                    setPriceRange('All');
                    setSortBy('Trending');
                }}>
                    <Typography variant="body" color={colors.primary}>Reset</Typography>
                </Pressable>
            </View>

            <Typography variant="h4" style={{ marginBottom: spacing.md }}>Price Range</Typography>
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
                {sorts.map((s) => {
                    const isSelected = sortBy === s;
                    return (
                        <Pressable
                            key={s}
                            onPress={() => setSortBy(s)}
                            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}
                        >
                            <Typography variant="body" color={colors.textPrimary}>{s}</Typography>
                            {isSelected && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                        </Pressable>
                    );
                })}
            </View>

            <Button title="Apply Filters" onPress={() => {
                onApply({ priceRange, sortBy });
                (ref as any)?.current?.close();
            }} style={{ marginTop: 'auto' }} />
        </BottomSheetWrapper>
    );
});

const styles = StyleSheet.create({
    pill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    }
});

export default FilterSheet;
