import { useTheme } from '@/hooks/useTheme';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Pressable, StyleSheet } from 'react-native';

interface ScrollToBottomButtonProps {
    visible: boolean;
    onPress: () => void;
}

export default function ScrollToBottomButton({ visible, onPress }: ScrollToBottomButtonProps) {
    const { colors } = useTheme();

    if (!visible) return null;

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel="Scroll to latest message"
            onPress={onPress}
            style={({ pressed }) => [
                styles.button,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.ink,
                    opacity: pressed ? 0.7 : 1,
                },
            ]}
        >
            <HugeiconsIcon icon={ArrowDown01Icon} size={22} color={colors.primary} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        right: 16,
        bottom: 12,
        zIndex: 5,
        width: 44,
        height: 44,
        borderRadius: 15,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.16,
        shadowRadius: 5,
        elevation: 4,
    },
});
