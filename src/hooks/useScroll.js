import { useState, useEffect } from 'react';

/**
 * Custom hook to detect scroll position
 * @param {number} threshold - Scroll position threshold in pixels
 * @returns {boolean} - Whether scroll position is past threshold
 */
const useScroll = (threshold = 100) => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            setIsScrolled(scrollPosition > threshold);
        };

        // Add scroll event listener
        window.addEventListener('scroll', handleScroll);

        // Check initial scroll position
        handleScroll();

        // Cleanup
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [threshold]);

    return isScrolled;
};

export default useScroll;
