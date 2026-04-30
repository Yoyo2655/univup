export default function manifest() {
  return {
    name: 'UnivUp',
    short_name: 'UnivUp',
    description: 'Prepare ton concours. Suis ta progression.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0e0d0d',
    theme_color: '#9b8ec4',
    orientation: 'portrait',
    icons: [
      {
        src: '/Logo2_univup.jpg',
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: '/Logo2_univup.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  }
}