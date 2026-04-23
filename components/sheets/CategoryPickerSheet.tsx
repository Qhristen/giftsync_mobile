import { useTheme } from '@/hooks/useTheme';
import { useGetCategoriesQuery } from '@/store/api/productApi';
import { Category } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Input from '../ui/Input';
import Typography from '../ui/Typography';

interface CategoryPickerSheetProps {
    currentCategoryId: string;
    onSelect: (category: Category) => void;
}

const CategoryPickerSheet = forwardRef<BottomSheetRef, CategoryPickerSheetProps>(({ currentCategoryId, onSelect }, ref) => {
    const { colors, spacing } = useTheme();
    const { data: categories = [], isLoading } = useGetCategoriesQuery();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCategories = useMemo(() => {
        return categories.filter(category =>
            category.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [categories, searchQuery]);

    const getIcon = (name: string) => {
        const mapping: Record<string, string> = {
            'Fashion': 'shirt-outline',
            'Food': 'fast-food-outline',
            'Drinks': 'beer-outline',
            'Home': 'home-outline',
            'Electronics': 'bulb-outline',
            'Beauty': 'sparkles-outline',
            'Gadgets': 'watch-outline',
            'Gift Cards': 'gift-outline',
            'Others': 'apps-outline',
        };
        return mapping[name] || 'apps-outline';
    };

    const handleSelect = (category: Category) => {
        onSelect(category);
    };

    return (
        <BottomSheetWrapper ref={ref} snapPoints={['60%', '85%']}
            scrollable
            keyboardBehavior="interactive"
            android_keyboardInputMode="adjustPan">
            <Typography variant="h3" style={{ marginBottom: spacing.lg }}>
                Select Category
            </Typography>

            <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                isBottomSheet
                leftIcon={<Ionicons name="search-outline" size={20} color={colors.textSecondary} />}
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
                    filteredCategories.map((category) => {
                        const isSelected = currentCategoryId === category.id;
                        return (
                            <Pressable
                                key={category.id}
                                onPress={() => handleSelect(category)}
                                style={[
                                    styles.item,
                                    {
                                        backgroundColor: isSelected ? colors.primarySoft : colors.surfaceRaised,
                                        borderColor: isSelected ? colors.primary : 'transparent',
                                    },
                                ]}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: isSelected ? colors.primary : colors.surface }]}>
                                    <Ionicons
                                        name={getIcon(category.name) as any}
                                        size={24}
                                        color={isSelected ? '#FFFFFF' : colors.textPrimary}
                                    />
                                </View>
                                <Typography
                                    variant="bodyMedium"
                                    color={isSelected ? colors.primary : colors.textPrimary}
                                >
                                    {category.name}
                                </Typography>
                                {isSelected && (
                                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} style={styles.check} />
                                )}
                            </Pressable>
                        );
                    })
                ) : (
                    <View style={styles.empty}>
                        <Ionicons name="search-outline" size={48} color={colors.textSecondary} style={{ opacity: 0.3, marginBottom: 16 }} />
                        <Typography variant="bodyMedium" color={colors.textSecondary} style={{ textAlign: 'center' }}>
                            No categories found for "{searchQuery}"
                        </Typography>
                    </View>
                )}
            </View>
        </BottomSheetWrapper>
    );
});

const styles = StyleSheet.create({
    horizontalScroll: {
        gap: 12,
        paddingRight: 20,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    list: {
        gap: 8,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginVertical: 2,
        borderRadius: 16,
        gap: 16,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    check: {
        marginLeft: 'auto',
    },
    empty: {
        paddingVertical: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContainer: {
        paddingVertical: 32,
        alignItems: 'center',
    }
});

export default CategoryPickerSheet;

