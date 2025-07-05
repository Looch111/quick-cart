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
      <path
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
        className="stroke-primary"
      />
      <path
        d="M15.5 9.5a3.5 3.5 0 0 0-3.5-3.5h-3a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h3a3.5 3.5 0 0 0 3.5-3.5v-4z"
        className="fill-primary stroke-primary"
      />
      <path d="M8.5 12h5" className="stroke-primary-foreground" />
    </svg>
);
