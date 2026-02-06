import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = ({
    width,
    height,
    variant = 'text', // text, title, circle, rect
    className = '',
    style = {}
}) => {
    const getVariantClass = () => {
        switch (variant) {
            case 'circle': return 'skeleton-circle';
            case 'title': return 'skeleton-title';
            case 'rect': return 'skeleton-rect';
            default: return 'skeleton-text';
        }
    };

    const combinedStyle = {
        width,
        height,
        ...style
    };

    return (
        <div
            className={`skeleton-loader ${getVariantClass()} ${className}`}
            style={combinedStyle}
            aria-hidden="true"
        ></div>
    );
};

export default SkeletonLoader;
