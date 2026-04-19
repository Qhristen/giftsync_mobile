import { useTheme } from '@/hooks/useTheme';
import { useGetCategoriesQuery } from '@/store/api/productApi';
import { Category } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Typography from '../ui/Typography';

interface CategoryPickerSheetProps {
    currentCategoryId: string;
    onSelect: (category: Category) => void;
}

const CategoryPickerSheet = forwardRef<BottomSheetRef, CategoryPickerSheetProps>(({ currentCategoryId, onSelect }, ref) => {
    const { colors, spacing } = useTheme();
    const { data: categories = [], isLoading } = useGetCategoriesQuery();

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
        <BottomSheetWrapper ref={ref} snapPoints={['60%']}
            scrollable
            keyboardBehavior="interactive"
            android_keyboardInputMode="adjustPan">
            <Typography variant="h3" style={{ marginBottom: spacing.lg }}>
                Select Category
            </Typography>

            <View style={styles.list}>
                {isLoading ? (
                    <ActivityIndicator color={colors.primary} />
                ) : (
                    categories.map((category) => {
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
                                <Ionicons
                                    name={getIcon(category.name) as any}
                                    size={24}
                                    color={isSelected ? colors.primary : colors.textPrimary}
                                />
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
                )}
            </View>
        </BottomSheetWrapper>
    );
});

const styles = StyleSheet.create({
    list: {
        gap: 12,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginVertical: 4,
        borderRadius: 12,
        // borderWidth: 1.5,
        gap: 16,
    },
    check: {
        marginLeft: 'auto',
    },
});

export default CategoryPickerSheet;
