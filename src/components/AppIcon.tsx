import type { SVGProps } from 'react'

type IconName =
  | 'layers'
  | 'search'
  | 'menu'
  | 'close'
  | 'chevron-down'
  | 'chevron-right'
  | 'arrow-right'
  | 'book'
  | 'folder'
  | 'file'
  | 'home'
  | 'play'
  | 'database'
  | 'code'
  | 'refresh'
  | 'bolt'
  | 'plus'
  | 'eye'
  | 'eye-off'
  | 'edit'
  | 'trash'
  | 'alert-circle'

interface AppIconProps extends SVGProps<SVGSVGElement> {
  name: IconName
  size?: number
}

/** Small, dependency-free icon set shared by the application shell. */
export function AppIcon({ name, size = 20, ...props }: AppIconProps) {
  const drawing = {
    layers: (
      <>
        <path d="m12 2 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5" />
        <path d="m3 17 9 5 9-5" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    close: (
      <>
        <path d="M5 5 19 19M19 5 5 19" />
      </>
    ),
    'chevron-down': <path d="m6 9 6 6 6-6" />,
    'chevron-right': <path d="m9 6 6 6-6 6" />,
    'arrow-right': (
      <>
        <path d="M4 12h16" />
        <path d="m14 6 6 6-6 6" />
      </>
    ),
    book: (
      <>
        <path d="M12 7c-2.4-2-5.6-2.5-9-2v14c3.5-.5 6.5 0 9 2 2.5-2 5.5-2.5 9-2V5c-3.4-.5-6.6 0-9 2Z" />
        <path d="M12 7v14" />
      </>
    ),
    folder: <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3V7Z" />,
    file: (
      <>
        <path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10Z" />
        <path d="M13 3v7h7M8 15h8M8 18h5" />
      </>
    ),
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v11h14V10M9 21v-7h6v7" />
      </>
    ),
    play: <path d="m8 5 11 7-11 7V5Z" />,
    database: (
      <>
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5M3 12c0 1.7 4 3 9 3s9-1.3 9-3" />
      </>
    ),
    code: (
      <>
        <path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" />
      </>
    ),
    bolt: <path d="m13.3 2-9.1 11h7l-1 9 9.6-12h-7L13.3 2Z" />,
    plus: <path d="M12 5v14M5 12h14" />,
    eye: (
      <>
        <path d="M2 12s3.7-7 10-7 10 7 10 7-3.7 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    'eye-off': (
      <>
        <path d="M9.8 5.3A11 11 0 0 1 12 5c6.3 0 10 7 10 7a14.7 14.7 0 0 1-3.2 3.8" />
        <path d="M6.5 6.6C3.7 8.4 2 12 2 12s3.7 7 10 7a10.8 10.8 0 0 0 4.1-.8" />
        <path d="M10 10a3 3 0 0 0 4 4M3 3l18 18" />
      </>
    ),
    edit: (
      <>
        <path d="M12 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
        <path d="m14 5 5 5M9 15l-1 3 3-1L21 7a2.1 2.1 0 0 0-3-3L9 15Z" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16M10 4h4M6 7l1 14h10l1-14M10 11v6M14 11v6" />
      </>
    ),
    'alert-circle': (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 7v6M12 17h.01" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 11a8 8 0 1 0-2 6" />
        <path d="M20 4v7h-7" />
      </>
    ),
  }[name]

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {drawing}
    </svg>
  )
}
