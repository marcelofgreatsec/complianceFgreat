'use client';

import React from 'react';

interface FgreatLogoProps {
    className?: string;
    size?: number;
    showText?: boolean;
}

export default function FgreatLogo({ className, size = 32, showText = true }: FgreatLogoProps) {
    return (
        <div
            className={className}
            style={{
                height: size,
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}
        >
            <svg
                width={size}
                height={size}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))' }}
            >
                {/* Background Shape */}
                <rect width="100" height="100" rx="20" fill="#0f141a" />

                {/* "F" - Laranja */}
                <path
                    d="M30 30H65V40H40V50H60V60H40V75H30V30Z"
                    fill="#F47920"
                />

                {/* "G" - Ciano Stylized */}
                <path
                    d="M75 55H55V65H65V70H55V45H75V80H45V35H75V45H65V40H55V35H70V45"
                    stroke="#00B1B0"
                    strokeWidth="4"
                    strokeLinecap="round"
                />

                {/* Accent Dots */}
                <circle cx="75" cy="30" radius="5" fill="#00B1B0" />
                <circle cx="85" cy="40" radius="5" fill="#F47920" />
            </svg>

            {showText && (
                <span
                    style={{
                        fontSize: size * 0.7,
                        fontWeight: 900,
                        letterSpacing: '-0.05em',
                        background: 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        lineHeight: 1,
                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                    }}
                >
                    FGREAT
                </span>
            )}
        </div>
    );
}
