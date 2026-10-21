import { moderateScale } from '@/utils/scaling';
import React from 'react';
import { HugeiconsIcon, HugeiconsProps } from '@hugeicons/react-native';

export interface IconProps extends Omit<HugeiconsProps, 'icon'> {
    icon: any;
    size?: number;
    color?: string;
}

export const Icon: React.FC<IconProps> = ({ icon, size = moderateScale(24), color, ...props }) => {
    return <HugeiconsIcon icon={icon} size={size} color={color} {...props} />;
};

export default Icon;
