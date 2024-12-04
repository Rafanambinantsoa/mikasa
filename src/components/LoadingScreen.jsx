import React from 'react';

const LoadingScreen = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#f5f5f5'
        }}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 200 200"
                width="120"
                height="120"
                style={{
                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
                }}
            >
                <style>
                    {`
            @keyframes crane {
              0%, 100% { transform: rotate(-3deg); }
              50% { transform: rotate(3deg); }
            }
            @keyframes load {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              50% { transform: translateY(-15px) rotate(5deg); }
            }
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(0.98); }
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-2px); }
            }
            .crane-arm {
              transform-origin: 100px 70px;
              animation: crane 3s ease-in-out infinite;
            }
            .load-box {
              animation: load 2.5s ease-in-out infinite;
            }
            .building {
              animation: pulse 2s ease-in-out infinite;
            }
            .base {
              animation: bounce 2s ease-in-out infinite;
            }
          `}
                </style>

                {/* Base */}
                <g className="base">
                    <rect x="85" y="160" width="30" height="25" rx="8" fill="#FFB74D" />
                    <rect x="80" y="155" width="40" height="10" rx="5" fill="#FFA726" />
                </g>

                {/* Building in progress */}
                <g className="building">
                    <rect x="45" y="110" width="110" height="50" rx="10" fill="#90A4AE" />
                    <rect x="55" y="120" width="25" height="25" rx="8" fill="#CFD8DC" />
                    <rect x="87" y="120" width="25" height="25" rx="8" fill="#CFD8DC" />
                    <rect x="119" y="120" width="25" height="25" rx="8" fill="#CFD8DC" />
                </g>

                {/* Crane arm */}
                <g className="crane-arm">
                    <rect x="95" y="60" width="12" height="100" rx="6" fill="#FFB74D" />
                    <rect x="85" y="60" width="90" height="12" rx="6" fill="#FFB74D" />
                    <path
                        d="M95 72 L175 72"
                        style={{
                            stroke: '#FFA726',
                            strokeWidth: '3',
                            strokeLinecap: 'round',
                            strokeDasharray: '8,8'
                        }}
                    />
                </g>

                {/* Load */}
                <g className="load-box">
                    <rect x="150" y="80" width="22" height="22" rx="6" fill="#FFA726" />
                    <rect x="153" y="83" width="16" height="16" rx="4" fill="#FFB74D" />
                </g>
            </svg>
            <p style={{
                marginTop: '20px',
                color: '#455A64',
                fontFamily: 'sans-serif',
                fontSize: '16px',
                fontWeight: '500',
                animation: 'bounce 2s ease-in-out infinite'
            }}>
                Loading...
            </p>
        </div>
    );
};

export default LoadingScreen;