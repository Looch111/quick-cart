import type { SVGProps } from "react";

export const BtcIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 7.533C4 5.034 6.012 3 8.5 3h4.438c2.488 0 4.5 2.034 4.5 4.533v8.934C17.438 18.966 15.426 21 12.938 21h-4.437C6.012 21 4 18.966 4 16.467z" />
    <path d="M8 8h5.5a2.5 2.5 0 0 1 0 5H8z" />
    <path d="M8 13h5.5a2.5 2.5 0 0 1 0 5H8z" />
    <path d="M11 3v18" />
  </svg>
);
