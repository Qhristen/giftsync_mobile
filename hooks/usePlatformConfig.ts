import { useAppSelector } from '@/store/hooks';

export const usePlatformConfig = () => {
    const { configs, status } = useAppSelector((state) => state.config);

    const getConfig = (key: string, defaultValue?: any) => {
        return configs[key] ?? defaultValue;
    };

    return {
        configs,
        status,
        getConfig,
        aiChatCost: getConfig('ai_chat_cost'),
        ngnUsdRate: getConfig('ngn_usd_rate'),
        usdPerCoin: getConfig('usd_per_coin'),
        occasionCreationCost: getConfig('occasion_creation_cost'),
        productCreationCost: getConfig('product_creation_cost'),
        deliveryFeeNgn: getConfig('delivery_fee_ngn'),
        packagingFeeNgn: getConfig('packaging_fee_ngn'),
    };
};
