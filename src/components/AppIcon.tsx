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
