export default function OwnerStoreIcon({ size = 24, style, ...props }) {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      style={style}
      {...props}
    >
      <path
        d="M256 32C150.2 32 64 118.2 64 224c0 135.2 176 256 192 256s192-120.8 192-256C448 118.2 361.8 32 256 32z"
        fill="#ff1010"
      />
      <path
        d="M144 130c0-8.8 7.2-16 16-16h36.6c11.5 0 22.3 5.4 29.2 14.6l20.3 27h120.9c22.1 0 40 17.9 40 40v12c0 12.4-10.1 22.5-22.5 22.5H278.1l22.1 58.6c3.4 9-3.2 18.4-12.9 18.4h-57.4c-6.2 0-11.6-3.8-13.8-9.5L177 196H152c-4.4 0-8-3.6-8-8v-58z"
        fill="none"
        stroke="#000"
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="196" cy="344" r="18" fill="#000" />
      <circle cx="296" cy="344" r="18" fill="#000" />
    </svg>
  )
}