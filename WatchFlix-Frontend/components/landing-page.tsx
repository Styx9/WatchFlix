'use client'

import { Play, Monitor, Download, Users, Star, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import type { Movie } from '@/lib/api'

const features = [
  {
    icon: Monitor,
    title: 'Watch Anywhere',
    description: 'Stream on your phone, tablet, laptop, and TV without paying more.',
  },
  {
    icon: Download,
    title: 'Download & Watch Offline',
    description: 'Save your favorites and always have something to watch.',
  },
  {
    icon: Users,
    title: 'Create Profiles',
    description: 'Each member gets personalized recommendations based on their tastes.',
  },
  {
    icon: Star,
    title: 'Rate & Review',
    description: 'Share your opinions and discover what others think about movies.',
  },
]

const stats = [
  { value: '10K+', label: 'Movies & Shows' },
  { value: '4K', label: 'Ultra HD Quality' },
  { value: '50M+', label: 'Happy Viewers' },
  { value: '24/7', label: 'Support' },
]

export function LandingPage({ movies }: { movies: Movie[] }) {
  const { openAuthModal } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with movie posters grid */}
        <div className="absolute inset-0 grid grid-cols-4 md:grid-cols-6 gap-2 opacity-20">
          {[...movies, ...movies, ...movies].slice(0, 24).map((movie, index) => (
            <div key={index} className="aspect-[2/3]">
              <img
                src={movie.poster}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center py-20">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-balance max-w-4xl mx-auto">
            Unlimited movies, TV shows, and more
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Watch anywhere. Cancel anytime. Discover stories that move you.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="gap-2 text-lg px-8 h-14"
              onClick={() => openAuthModal('register')}
            >
              <Play className="h-5 w-5 fill-current" />
              Start Watching
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 text-lg px-8 h-14"
              onClick={() => openAuthModal('login')}
            >
              Sign In
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-muted-foreground rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Why Choose Watchflix?</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Everything you need for the ultimate streaming experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 transition-colors"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">Trending Now</h2>
              <p className="mt-2 text-muted-foreground">See what everyone is watching</p>
            </div>
            <Button variant="outline" onClick={() => openAuthModal('register')}>
              View All
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {movies.slice(0, 4).map((movie, index) => (
              <div key={movie.id} className="group relative">
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-secondary">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-4xl font-bold text-primary/30 mb-2">
                      #{index + 1}
                    </div>
                    <h3 className="font-semibold text-sm line-clamp-1">{movie.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      <span>{movie.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to watch?</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Create an account now and start streaming thousands of movies and TV shows.
          </p>
          <Button
            size="lg"
            className="mt-8 gap-2 text-lg px-8 h-14"
            onClick={() => openAuthModal('register')}
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  )
}
