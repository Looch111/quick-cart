import type { SVGProps } from "react";

export const EthIcon = (props: SVGProps<SVGSVGElement>) => (
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
    <path d="M12 2 4.5 11l7.5 3 7.5-3L12 2z" />
    <path d="m4.5 11 7.5 9 7.5-9" />
    <path d="M12 22V14" />
  </svg>
);
