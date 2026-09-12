import React from 'react';
import * as icons from 'lucide-react';

export const ALL_LUCIDE_ICONS = Object.keys(icons)
    .filter((key) => key.match(/^[A-Z][a-zA-Z]+$/) && !["LucideProps", "Icon", "Icons", "CreateLucideIcon"].includes(key) && (typeof (icons as any)[key] === 'function' || typeof (icons as any)[key] === 'object'))
    .map((key) => {
        const IconComponent = (icons as any)[key];
        return {
            label: key,
            value: key,
            icon: <IconComponent />,
        };
    })
    .filter(item => item.icon !== undefined);
