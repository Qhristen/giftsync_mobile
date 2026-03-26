import { useTheme } from '@/hooks/useTheme';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Button from '../ui/Button';
import Typography from '../ui/Typography';
import { typography } from '@/theme';

interface Props {
    onVerify: (otp: string) => Promise<void>;
    onResend: () => Promise<void>;
    isLoading?: boolean;
}

const OTPVerificationSheet = forwardRef<BottomSheetRef, Props>(
    ({ onVerify, onResend, isLoading }, ref) => {
        const { spacing, colors } = useTheme();
        const [otp, setOtp] = useState(['', '', '', '', '', '']);
        const inputs = useRef<TextInput[]>([]);
        const [resendTimer, setResendTimer] = useState(60);
        const [isResending, setIsResending] = useState(false);

        useEffect(() => {
            let timer: NodeJS.Timeout;
            if (resendTimer > 0) {
                timer = setInterval(() => setResendTimer((t) => t - 1), 1000);
            }
            return () => clearInterval(timer);
        }, [resendTimer]);

        const handleOtpChange = (text: string, index: number) => {
            const newOtp = [...otp];
            newOtp[index] = text.slice(-1);
            setOtp(newOtp);

            if (text && index < 5) {
                inputs.current[index + 1].focus();
            }
        };

        const handleKeyPress = (e: any, index: number) => {
            if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
                inputs.current[index - 1].focus();
            }
        };

        const handleVerify = async () => {
            const otpString = otp.join('');
            if (otpString.length === 6) {
                await onVerify(otpString);
            }
        };

        const handleResend = async () => {
            if (resendTimer === 0) {
                setIsResending(true);
                await onResend();
                setIsResending(false);
                setResendTimer(60);
            }
        };

        return (
            <BottomSheetWrapper ref={ref} snapPoints={['60%']}>
                <View style={styles.content}>
                    <Typography variant="h2" align="center" style={{ marginBottom: spacing.sm }}>
                        Verify Account
                    </Typography>
                    <Typography variant="body" align="center" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
                        We've sent a 6-digit code to your phone.
                    </Typography>

                    <View style={styles.otpGrid}>
                        {otp.map((digit, i) => (
                            <TextInput
                                key={i}
                                ref={(el) => (inputs.current[i] = el!)}
                                style={[
                                    styles.otpInput,
                                    {
                                        backgroundColor: colors.surfaceRaised,
                                        borderColor: digit ? colors.primary : colors.border,
                                        color: colors.textPrimary,
                                    },
                                ]}
                                value={digit}
                                onChangeText={(text) => handleOtpChange(text, i)}
                                onKeyPress={(e) => handleKeyPress(e, i)}
                                keyboardType="numeric"
                                maxLength={1}
                                autoFocus={i === 0}
                            />
                        ))}
                    </View>

                    <View style={styles.resendContainer}>
                        {resendTimer > 0 ? (
                            <Typography variant="body" align="center">
                                Resend code in <Typography variant="bodyBold" color={colors.primary}>{resendTimer}s</Typography>
                            </Typography>
                        ) : (
                            <Pressable onPress={handleResend} disabled={isResending}>
                                {isResending ? (
                                    <ActivityIndicator color={colors.primary} />
                                ) : (
                                    <Typography variant="bodyBold" color={colors.primary} align="center">
                                        Resend Code
                                    </Typography>
                                )}
                            </Pressable>
                        )}
                    </View>

                    <Button
                        title="Verify & Continue"
                        onPress={handleVerify}
                        isLoading={isLoading}
                        disabled={otp.join('').length < 6}
                        style={{ marginTop: spacing.xl }}
                    />
                </View>
            </BottomSheetWrapper>
        );
    }
);

const styles = StyleSheet.create({
    content: {
        paddingVertical: 12,
    },
    otpGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 32,
    },
    otpInput: {
        width: 50,
        height: 60,
        borderRadius: 12,
        borderWidth: 1.5,
        textAlign: 'center',
        fontSize: 24,
        fontFamily: typography.fonts.heading,
    },
    resendContainer: {
        marginVertical: 12,
    },
});

export default OTPVerificationSheet;
