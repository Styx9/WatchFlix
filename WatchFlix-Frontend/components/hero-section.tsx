'use client'

import { Info, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { Movie } from '@/lib/api'

interface HeroSectionProps {
  movie: Movie
}

export function HeroSection({ movie }: HeroSectionProps) {
  return (
    <section className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={movie.backdrop}
          alt={movie.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-end pb-24 md:pb-32">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold text-balance">{movie.title}</h1>

          <div className="flex items-center gap-4 mt-4 text-sm md:text-base">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-primary text-primary" />
              <span className="font-semibold">{movie.rating}</span>
            </div>
            <span className="text-muted-foreground">{movie.year}</span>
            <span className="text-muted-foreground">{movie.duration}</span>
            <span className="px-2 py-0.5 bg-secondary rounded text-xs font-medium">
              {movie.category}
            </span>
          </div>

          <p className="mt-4 text-muted-foreground text-sm md:text-base line-clamp-3 max-w-xl">
            {movie.description}
          </p>

          <div className="flex items-center gap-3 mt-6">
            <Link href={`/movie/${movie.id}`}>
              <Button size="lg" variant="secondary" className="gap-2">
                <Info className="h-5 w-5" />
                More Info
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
