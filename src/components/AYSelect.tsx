'use client';

import { useRouter } from 'next/navigation';

interface AYSelectProps {
  currentAY: string;
  ayOptions: string[];
}

export default function AYSelect({ currentAY, ayOptions }: AYSelectProps) {
  const router = useRouter();

  return (
    <div className="relative inline-flex items-center">
      <select
        id="ay-select"
        value={currentAY}
        onChange={(e) => {
          router.push(`/?ay=${e.target.value}`);
        }}
        style={{
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          background: '#ffffff',
          border: '1.5px solid #e0e4ec',
          borderRadius: '9999px',
          padding: '0 36px 0 20px',
          height: '40px',
          fontSize: '14px',
          fontWeight: 700,
          color: '#1e293b',
          cursor: 'pointer',
          outline: 'none',
          minWidth: '140px',
          lineHeight: '37px', // accounting for border
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#3b82f6';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#e0e4ec';
          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.05)';
        }}
      >
        {ayOptions.map((ay) => (
          <option key={ay} value={ay}>
            {ay}
          </option>
        ))}
      </select>
      {/* Custom dropdown chevron */}
      <svg
        width="12"
        height="8"
        viewBox="0 0 12 8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          right: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
        }}
      >
        <path
          d="M1 1.5L6 6.5L11 1.5"
          stroke="#2563eb"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
