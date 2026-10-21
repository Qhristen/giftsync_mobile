import { useTheme } from '@/hooks/useTheme';
import { useGetCategoriesQuery } from '@/store/api/productApi';
import { Category } from '@/types';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    AppleIcon,
    CheckmarkCircle02Icon,
    DashboardSquare01Icon,
    Dress01Icon,
    FlashIcon,
    GiftIcon,
    Home01Icon,
    Search01Icon,
    SmileIcon,
    WatchIcon,
} from '@hugeicons/core-free-icons';
import React, { forwardRef, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Input from '../ui/Input';
import Typography from '../ui/Typography';
import { moderateScale } from '@/utils/scaling';

interface CategoryPickerSheetProps {
    currentCategoryId: string;
    onSelect: (category: Category) => void;
}

const CategoryPickerSheet = forwardRef<BottomSheetRef, CategoryPickerSheetProps>(({ currentCategoryId, onSelect }, ref) => {
    const { colors, spacing } = useTheme();
    const { data: categories = [], isLoading } = useGetCategoriesQuery({ hasProductsOnly: false });
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCategories = useMemo(() => {
        return categories.filter(category =>
            category.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [categories, searchQuery]);

    const getIcon = (name: string) => {
        const mapping: Record<string, any> = {
            'Fashion': Dress01Icon,
            'Food': AppleIcon,
            'Drinks': AppleIcon,
            'Home': Home01Icon,
            'Electronics': FlashIcon,
            'Beauty': SmileIcon,
            'Gadgets': WatchIcon,
            'Gift Cards': GiftIcon,
            'Others': DashboardSquare01Icon,
        };
        return mapping[name] || DashboardSquare01Icon;
    };

    const handleSelect = (category: Category) => {
        onSelect(category);
    };

    return (
        <BottomSheetWrapper ref={ref} snapPoints={['60%', '85%']}
            scrollable
            keyboardBehavior="interactive"
            android_keyboardInputMode="adjustPan">
            <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>CATALOGUE DRAWER</Typography>
            <Typography variant="h2" style={{ marginBottom: spacing.lg }}>Choose a category</Typography>

            <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                isBottomSheet
                leftIcon={<HugeiconsIcon icon={Search01Icon} size={moderateScale(20)} color={colors.textSecondary} />}
                style={{ marginBottom: spacing.lg }}
            />

            <View style={styles.list}>
                {!searchQuery && !isLoading && categories.length > 0 && (
                    <Typography variant="label" color={colors.textSecondary} style={{ marginBottom: spacing.xs }}>
                        All Categories
                    </Typography>
                )}

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color={colors.primary} />
                    </View>
                ) : filteredCategories.length > 0 ? (
                    filteredCategories.map((category, index) => {
                        const isSelected = currentCategoryId === category.id;
                        return (
                            <Pressable
                                key={category.id}
                                onPress={() => handleSelect(category)}
                                style={[
                                    styles.item,
                                    {
                                        backgroundColor: [colors.lemon, colors.lavender, colors.mint, colors.peach][index % 4],
                                        borderColor: colors.ink,
                                    },
                                ]}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: isSelected ? colors.lime : colors.surface, borderColor: colors.ink }]}>
                                    <HugeiconsIcon
                                        icon={getIcon(category.name)}
                                        size={moderateScale(24)}
                                        color={colors.ink}
                                    />
                                </View>
                                <Typography
                                    variant="bodyMedium"
                                    color={colors.textPrimary}
                                >
                                    {category.name}
                                </Typography>
                                {isSelected && (
                                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={moderateScale(24)} color={colors.ink} style={styles.check} />
                                )}
                            </Pressable>
                        );
                    })
                ) : (
                    <View style={styles.empty}>
                        <HugeiconsIcon icon={Search01Icon} size={moderateScale(48)} color={colors.textSecondary} style={{ opacity: 0.3, marginBottom: moderateScale(16) }} />
                        <Typography variant="bodyMedium" color={colors.textSecondary} style={{ textAlign: 'center' }}>
                            No categories found for &quot;{searchQuery}&quot;
                        </Typography>
                    </View>
                )}
            </View>
        </BottomSheetWrapper>
    );
});

const styles = StyleSheet.create({
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: moderateScale(1) },
    list: {
        gap: moderateScale(8),
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: moderateScale(12),
        marginVertical: moderateScale(2),
        borderRadius: moderateScale(16),
        borderWidth: 1.5,
        gap: moderateScale(16),
    },
    iconContainer: {
        width: moderateScale(44),
        height: moderateScale(44),
        borderRadius: moderateScale(12),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.25,
    },
    check: {
        marginLeft: 'auto',
    },
    empty: {
        paddingVertical: moderateScale(48),
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContainer: {
        paddingVertical: moderateScale(32),
        alignItems: 'center',
    }
});

CategoryPickerSheet.displayName = 'CategoryPickerSheet';

export default CategoryPickerSheet;

