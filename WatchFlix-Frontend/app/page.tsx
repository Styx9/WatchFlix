'use client'

import { useEffect, useMemo, useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { AuthModal } from '@/components/auth-modal'
import { LandingPage } from '@/components/landing-page'
import { HeroSection } from '@/components/hero-section'
import { MovieRow } from '@/components/movie-row'
import { useAuth } from '@/lib/auth-context'
import { getClientRecommendationMovies, getMovies, getPopularMovies, type Movie } from '@/lib/api'

function HomeContent() {
  const { isAuthenticated, user } = useAuth()
  const [movies, setMovies] = useState<Movie[]>([])
  const [popularMovies, setPopularMovies] = useState<Movie[]>([])
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([])

  useEffect(() => {
    const run = async () => {
      try {
        const allMovies = await getMovies()
        const popular = await getPopularMovies(8).catch(() => [])
        setMovies(allMovies)
        setPopularMovies(popular)
      } catch (error) {
        console.error(error)
      }
    }
    run()
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setRecommendedMovies([])
      return
    }

    getClientRecommendationMovies(user.id)
      .then(setRecommendedMovies)
      .catch((error) => {
        console.error(error)
        setRecommendedMovies([])
      })
  }, [isAuthenticated, user?.id])

  const categories = useMemo(
    () => Array.from(new Set(movies.map((movie) => movie.category))),
    [movies]
  )

  const featuredMovie = popularMovies[0] || movies[0]

  if (!isAuthenticated) {
    return (
      <>
        <Header variant="transparent" />
        <LandingPage movies={movies} />
        <Footer />
        <AuthModal />
      </>
    )
  }

  if (!featuredMovie) {
    return (
      <>
        <Header variant="transparent" />
        <main className="min-h-screen pt-24 container mx-auto px-4">Loading movies...</main>
        <Footer />
        <AuthModal />
      </>
    )
  }

  // Get movies by category for the authenticated view
  const moviesByCategory = categories
    .map((category) => ({
      category,
      movies: movies.filter((m) => m.category === category),
    }))
    .filter((group) => group.movies.length > 0)

  return (
    <>
      <Header variant="transparent" />
      <main>
        <HeroSection movie={featuredMovie} />
        
        <div className="container mx-auto px-4 py-8 space-y-10 -mt-32 relative z-10">
          <MovieRow 
            title="Trending Now" 
            movies={popularMovies.length ? popularMovies : movies.slice(0, 8)} 
            variant="large"
          />
          
          <MovieRow 
            title="Continue Watching" 
            movies={movies.slice(2, 6)} 
          />

          <MovieRow
            title="Recommended For You"
            movies={recommendedMovies}
          />

          {moviesByCategory.slice(0, 4).map(({ category, movies: categoryMovies }) => (
            <MovieRow
              key={category}
              title={category}
              movies={categoryMovies}
            />
          ))}

          <MovieRow 
            title="Top Rated" 
            movies={[...movies].sort((a, b) => b.rating - a.rating).slice(0, 8)} 
          />
        </div>
      </main>
      <Footer />
      <AuthModal />
    </>
  )
}

export default function Home() {
  return <HomeContent />
}
