import type { SVGProps } from 'react';

export const AppLogo = (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7 10h10" className="stroke-primary" />
      <path d="M7 14h10" className="stroke-primary" />
      <path d="m19 12-3-3" className="stroke-primary" />
      <path d="m5 12 3 3" className="stroke-primary" />
      <path d="m5 12 3-3" className="stroke-primary" />
      <path d="m19 12-3 3" className="stroke-primary" />
    </svg>
);
