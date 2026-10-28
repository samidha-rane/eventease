import Reveal from '@/components/Reveal'
import { gallery } from '@/lib/images'

export default function PhotoGallery() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <Reveal>
        <p className="text-sm font-bold uppercase tracking-widest text-brand">Moments</p>
        <h2 className="mt-2 max-w-xl font-display text-4xl font-extrabold tracking-tight md:text-5xl">
          Events people remember
        </h2>
      </Reveal>

      <div className="mt-10 grid auto-rows-[10rem] grid-cols-2 gap-4 md:auto-rows-[13rem] md:grid-cols-4">
        {gallery.map((item, index) => (
          <Reveal key={item.src} delay={index * 100} className={`h-full ${item.span}`}>
            <figure className="group relative size-full overflow-hidden rounded-3xl bg-ink">
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                className="size-full object-cover transition duration-700 group-hover:scale-110"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/85 to-transparent p-4 text-sm font-semibold text-white opacity-0 transition duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
                {item.caption}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  )
}