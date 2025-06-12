import React from 'react';

interface TopRightCurveProps {
  theme: string;
}

const CurveSvg = ({ theme }: TopRightCurveProps) => (
  <svg
    className="absolute -right-8 h-9 origin-top-left skew-x-[30deg] overflow-visible"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 128 32"
    xmlSpace="preserve"
  >
    <line
      stroke={theme === 'dark' ? '#1C151A' : '#F2E1F4'}
      strokeWidth="2px"
      shapeRendering="optimizeQuality"
      vectorEffect="non-scaling-stroke"
      strokeLinecap="round"
      strokeMiterlimit="10"
      x1="1"
      y1="0"
      x2="128"
      y2="0"
    ></line>
    <path
      stroke="hsl(var(--chat-border))"
      className="translate-y-[0.5px]"
      fill={theme === 'dark' ? '#1C151A' : '#F2E1F4'}
      shapeRendering="optimizeQuality"
      strokeWidth="1px"
      strokeLinecap="round"
      strokeMiterlimit="10"
      vectorEffect="non-scaling-stroke"
      d="M0,0c5.9,0,10.7,4.8,10.7,10.7v10.7c0,5.9,4.8,10.7,10.7,10.7H128V0"
    ></path>
  </svg>
);

export default function TopRightCurve({ theme }: TopRightCurveProps) {
  return (
    <div
      className="group pointer-events-none absolute top-[0.92em] z-10 -mb-8 h-32 w-full origin-top transition-all ease-snappy"
    >
      <CurveSvg theme={theme} />
    </div>
  );
}