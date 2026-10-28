export type GalleryItem = {
  src: string
  alt: string
  caption: string
  span: string
}

const tech = [
  '/images/tech-expo.jpg',
  '/images/tech-brain-stage.jpg',
  '/images/tech-conference.jpg',
  '/images/workshop.jpg',
]

const pools: Record<string, string[]> = {
  Technical: tech,
  Webinar: ['/images/tech-conference.jpg', '/images/tech-brain-stage.jpg'],
  Seminar: ['/images/workshop.jpg', '/images/tech-conference.jpg'],
  Workshop: ['/images/workshop.jpg', '/images/tech-expo.jpg'],
  Competition: ['/images/tech-expo.jpg', '/images/bunting.jpg'],
  Cultural: ['/images/festival-ribbons.jpg', '/images/bunting.jpg'],
}

const fallback = ['/images/workshop.jpg', '/images/tech-expo.jpg', '/images/festival-ribbons.jpg']

// Events whose title sounds technical get the technology photos
const techWords =
  /\b(tech|technical|ai|data|python|cloud|code|coding|hackathon|web|software|cyber|security|robot|digital|developer|design|app)\b/i

// Three different crops of the same photo, so repeats don't look identical
const crops = ['50% 12%', '50% 50%', '50% 88%']

function hash(text: string) {
  let value = 0
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) >>> 0
  return value
}

type Source = {
  id: string
  title: string
  bannerUrl: string | null
  category: { name: string }
}

export function eventImage(event: Source) {
  if (event.bannerUrl) return { src: event.bannerUrl, position: '50% 50%' }

  const pool = techWords.test(event.title) ? tech : (pools[event.category.name] ?? fallback)
  const value = hash(event.id)

  return {
    src: pool[value % pool.length],
    position: crops[Math.floor(value / 7) % crops.length],
  }
}

export const gallery: GalleryItem[] = [
  {
    src: '/images/tech-expo.jpg',
    alt: 'An expo hall with lit display stands and a refreshments table',
    caption: 'Expos and showcases',
    span: 'col-span-2 row-span-2',
  },
  {
    src: '/images/tech-brain-stage.jpg',
    alt: 'A speaker presenting on a stage with a large screen',
    caption: 'Talks and seminars',
    span: 'row-span-2',
  },
  {
    src: '/images/workshop.jpg',
    alt: 'A speaker presenting to a seated group in a bright hall',
    caption: 'Workshops',
    span: '',
  },
  {
    src: '/images/festival-ribbons.jpg',
    alt: 'Guests gathered under colourful ribbons at an outdoor festival',
    caption: 'Festivals',
    span: '',
  },
]