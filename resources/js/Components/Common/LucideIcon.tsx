import React from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface LucideIconProps extends LucideProps {
    name: string | undefined;
    fallback?: React.ReactNode;
}

/**
 * Dynamic Lucide Icon component with fallback for strings/emojis.
 * Useful for rendering icons stored as strings in the database.
 */
const LucideIcon = ({ name, fallback, ...props }: LucideIconProps) => {
    if (!name) return <>{fallback}</>;

    // Type casting to access the LucideIcons object with a string key
    const IconComponent = (LucideIcons as any)[name];

    if (IconComponent) {
        return <IconComponent {...props} />;
    }

    // Fallback: If it's not a Lucide icon, it might be an emoji or raw text
    return (
        <span className={props.className} style={{ fontSize: props.size || '1rem' }}>
            {name}
        </span>
    );
};

export default LucideIcon;
