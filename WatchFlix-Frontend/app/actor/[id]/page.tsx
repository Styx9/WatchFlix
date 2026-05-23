'use client'

import { use, useEffect, useState } from 'react'
import { Calendar, Clapperboard, User } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { AuthModal } from '@/components/auth-modal'
import { MovieRow } from '@/components/movie-row'
import { getActorDetails, getMoviesByActor, type Actor, type Movie } from '@/lib/api'

function ActorDetailsContent({ actorId }: { actorId: string }) {
  const [actor, setActor] = useState<Actor | null>(null)
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [actorData, actorMovies] = await Promise.all([
          getActorDetails(actorId),
          getMoviesByActor(actorId),
        ])
        setActor(actorData)
        setMovies(actorMovies)
      } catch (error) {
        console.error(error)
        setActor(null)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [actorId])

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 container mx-auto px-4">Loading actor...</main>
        <Footer />
      </>
    )
  }

  if (!actor) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 container mx-auto px-4">Actor not found.</main>
        <Footer />
      </>
    )
  }

  const fullName = `${actor.firstName || ''} ${actor.lastName || ''}`.trim()

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        <section className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-44 md:w-64 flex-shrink-0">
              <div className="aspect-square overflow-hidden rounded-lg bg-secondary border border-border">
                <img src={actor.photo} alt={actor.name} className="h-full w-full object-cover" />
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-bold">{actor.name}</h1>
              <div className="mt-6 grid sm:grid-cols-2 gap-4 max-w-2xl">
                <div className="p-4 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    Stage name
                  </div>
                  <p className="mt-2 font-medium">{actor.stageName || actor.name}</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    Full name
                  </div>
                  <p className="mt-2 font-medium">{fullName || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Birth date
                  </div>
                  <p className="mt-2 font-medium">
                    {actor.birthDate ? new Date(actor.birthDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clapperboard className="h-4 w-4" />
                    Movies in database
                  </div>
                  <p className="mt-2 font-medium">{movies.length}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-12">
          <MovieRow title="Movies With This Actor" movies={movies} />
        </section>
      </main>
      <Footer />
      <AuthModal />
    </>
  )
}

export default function ActorDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <ActorDetailsContent actorId={id} />
}
