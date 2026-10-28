export type GalleryItem = {
  src: string
  alt: string
  caption: string
  span: string
}

// The three photos sharp enough for large event cards
const cardImages = [
  '/images/festival-ribbons.jpg',
  '/images/bunting.jpg',
  '/images/workshop.jpg',
]

const byCategory: Record<string, string> = {
  Cultural: '/images/festival-ribbons.jpg',
  Competition: '/images/bunting.jpg',
  Seminar: '/images/workshop.jpg',
}

// Same category always gets the same photo, and new categories still get one
export function categoryImage(name: string): string {
  if (byCategory[name]) return byCategory[name]
  const sum = [...name].reduce((total, char) => total + char.charCodeAt(0), 0)
  return cardImages[sum % cardImages.length]
}

export const gallery: GalleryItem[] = [
  {
    src: '/images/festival-ribbons.jpg',
    alt: 'Guests gathered under a canopy of colourful ribbons at an outdoor festival',
    caption: 'Outdoor festivals',
    span: 'col-span-2 row-span-2 md:row-span-3',
  },
  {
    src: '/images/workshop.jpg',
    alt: 'A speaker presenting to a seated group in a bright hall',
    caption: 'Workshops and talks',
    span: 'col-span-2',
  },
  {
    src: '/images/bunting.jpg',
    alt: 'Purple and blue bunting over a red carpet walkway',
    caption: 'Campus celebrations',
    span: 'row-span-2',
  },
  {
    src: '/images/stage-flowers.jpg',
    alt: 'A stage decorated with paper flowers',
    caption: 'Cultural programmes',
    span: '',
  },
  {
    src: '/images/book-stall.jpg',
    alt: 'A stall with books and crafts on a lawn',
    caption: 'Fairs and exhibitions',
    span: '',
  },
]