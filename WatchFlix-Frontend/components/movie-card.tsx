'use client'

import Link from 'next/link'
import { Play, Star, Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Movie } from '@/lib/api'
import { useState } from 'react'

interface MovieCardProps {
  movie: Movie
  variant?: 'default' | 'large'
}

export function MovieCard({ movie, variant = 'default' }: MovieCardProps) {
  const [isInList, setIsInList] = useState(false)

  return (
    <div className="group relative flex-shrink-0">
      <Link href={`/movie/${movie.id}`}>
        <div
          className="relative overflow-hidden rounded-lg bg-secondary aspect-[2/3] w-full"
        >
          <img
            src={movie.poster}
            alt={movie.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Rating badge */}
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md">
            <Star className="h-3 w-3 fill-primary text-primary" />
            <span className="text-xs font-medium">{movie.rating}</span>
          </div>

          {/* Play button on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
              <Play className="h-5 w-5 text-primary-foreground fill-primary-foreground ml-0.5" />
            </div>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="mt-2">
        <Link href={`/movie/${movie.id}`}>
          <h3 className="font-medium text-sm line-clamp-1 hover:text-primary transition-colors">
            {movie.title}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span>{movie.year}</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground" />
          <span>{movie.category}</span>
        </div>
      </div>

      {/* Add to list button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 left-2 h-8 w-8 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.preventDefault()
          setIsInList(!isInList)
        }}
        aria-label={isInList ? 'Remove from list' : 'Add to list'}
      >
        {isInList ? (
          <Check className="h-4 w-4 text-primary" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
