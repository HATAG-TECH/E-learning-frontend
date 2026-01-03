import { useEffect, useRef, useState } from 'react';

const ScrollReveal = ({
    children,
    animation = 'fade-up',
    delay = 0,
    duration = 0,
    threshold = 0.1,
    className = ''
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold: threshold,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [threshold]);

    const getAnimationClass = () => {
        switch (animation) {
            case 'fade-in': return 'reveal-fade-in';
            case 'scale-up': return 'reveal-scale-up';
            default: return 'reveal-fade-up';
        }
    };

    const style = {
        transitionDelay: `${delay}ms`,
        transitionDuration: duration ? `${duration}ms` : undefined
    };

    return (
        <div
            ref={ref}
            className={`${getAnimationClass()} ${isVisible ? 'reveal-active' : ''} ${className}`}
            style={style}
        >
            {children}
        </div>
    );
};

export default ScrollReveal;
