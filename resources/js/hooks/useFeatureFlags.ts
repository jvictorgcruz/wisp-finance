import { usePage } from '@inertiajs/react';

interface SharedProps {
    features?: Record<string, boolean>;
    [key: string]: any;
}

export function useFeatureFlags() {
    const page = usePage();
    const props = page.props as SharedProps;
    const features = props.features || {};

    const isAvailable = (feature: string): boolean => {
        return !!features[feature];
    };

    const allFlags = (): Record<string, boolean> => {
        return features;
    };

    return {
        isAvailable,
        allFlags,
        features
    };
}
