type P = { size?: number };
const base = (size: number) => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true,
});

export const CameraIcon = ({ size = 64 }: P) => (
  <svg {...base(size)}><path d="M4 8h3l1.6-2.4h6.8L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" /><circle cx="12" cy="13" r="3.6" /></svg>
);
export const CartonIcon = ({ size = 64 }: P) => (
  <svg {...base(size)}><path d="M7 3h10l1.5 4v13a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V7L7 3Z" /><path d="M5.5 7h13M9 3v4m6-4v4" /><path d="M9 12h6M9 15.5h6" /></svg>
);
export const TrashIcon = ({ size = 22 }: P) => (
  <svg {...base(size)}><path d="M4 7h16M10 11v6m4-6v6" /><path d="M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M9 7V4.5A.5.5 0 0 1 9.5 4h5a.5.5 0 0 1 .5.5V7" /></svg>
);
export const PinIcon = ({ size = 22 }: P) => (
  <svg {...base(size)}><path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
);
export const ChevronLeft = ({ size = 26 }: P) => (
  <svg {...base(size)} strokeWidth={2.2}><path d="m15 5-7 7 7 7" /></svg>
);
export const ImageIcon = ({ size = 24 }: P) => (
  <svg {...base(size)}><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m4 17 5-4.5 3.5 3L16 12l4 4" /></svg>
);
export const RecycleLogo = ({ size = 28 }: P) => (
  <svg {...base(size)} stroke="#fff" strokeWidth={2}>
    <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
    <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" />
    <path d="m14 16-3 3 3 3" />
    <path d="M8.293 13.596 7.196 9.5 3.1 10.598" />
    <path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843" />
    <path d="m13.378 9.633 4.096 1.098 1.097-4.096" />
  </svg>
);
