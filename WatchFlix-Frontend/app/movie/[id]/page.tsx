'use client'

import { useState, use, useEffect } from 'react'
import Link from 'next/link'
import {
  Play,
  Star,
  Clock,
  Calendar,
  Film,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { AuthModal } from '@/components/auth-modal'
import { MovieRow } from '@/components/movie-row'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/lib/auth-context'
import {
  addComment,
  addVote,
  addWatch,
  getMovieDetails,
  getMovies,
  getPredefinedOptions,
  saveClientOptions,
  type Movie,
  type PredefinedOption,
} from '@/lib/api'

function MovieDetailsContent({ movieId }: { movieId: string }) {
  const [movie, setMovie] = useState<Movie | null>(null)
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([])
  const [showAllComments, setShowAllComments] = useState(false)
  const [options, setOptions] = useState<PredefinedOption[]>([])
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([])
  const [reviewText, setReviewText] = useState('')
  const [rating, setRating] = useState(8)
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState('')
  const { isAuthenticated, openAuthModal, user } = useAuth()

  useEffect(() => {
    const load = async () => {
      try {
        const [details, allMovies, predefinedOptions] = await Promise.all([
          getMovieDetails(movieId),
          getMovies(),
          getPredefinedOptions(),
        ])
        if (!details) {
          setMovie(null)
          return
        }
        setMovie(details)
        setOptions(predefinedOptions)
        setSelectedVersionId(details.versions[0]?.id || null)
        setRelatedMovies(
          allMovies.filter((m) => m.category === details.category && m.id !== details.id).slice(0, 12)
        )
      } catch (error) {
        console.error(error)
      }
    }
    load()
  }, [movieId])

  const handleWatch = async (versionId?: string) => {
    if (!isAuthenticated || !user?.id) {
      openAuthModal('login')
      return
    }

    if (!movie) {
      setStatusMessage('Filmul nu este incarcat.')
      return
    }

    const activeVersionId = versionId || selectedVersionId || movie.versions[0]?.id || '0'

    try {
      await addWatch(user.id, movie.id, activeVersionId)
      setStatusMessage('Vizualizarea a fost inregistrata in istoric.')
    } catch (error) {
      console.error(error)
      setStatusMessage('Vizualizarea nu a putut fi salvata.')
    }
  }

  const handleSubmitReview = async () => {
    if (!isAuthenticated || !user?.id || !movie) {
      openAuthModal('login')
      return
    }
    if (reviewText.trim().length < 3) {
      setStatusMessage('Comentariul trebuie sa aiba cel putin 3 caractere.')
      return
    }

    try {
      await addVote(user.id, movie.id, rating)
      const savedComment = await addComment(user.id, movie.id, reviewText.trim(), rating)
      await saveClientOptions(user.id, movie.id, selectedOptionIds)
      setMovie({
        ...movie,
        comments: [{ ...savedComment, userName: user.name || user.username }, ...movie.comments],
        rating,
      })
      setReviewText('')
      setSelectedOptionIds([])
      setStatusMessage(`Review salvat. Sentiment detectat: ${savedComment.sentiment}.`)
    } catch (error) {
      console.error(error)
      setStatusMessage('Review-ul nu a putut fi salvat.')
    }
  }

  const toggleOption = (id: number) => {
    setSelectedOptionIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }

  if (!movie) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 container mx-auto px-4">Loading movie...</main>
        <Footer />
      </>
    )
  }

  const displayedComments = showAllComments
    ? movie.comments
    : movie.comments.slice(0, 3)

  const getSentimentColor = (sentiment: 'positive' | 'neutral' | 'negative') => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-500'
      case 'negative':
        return 'text-red-500'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <>
      <Header variant="transparent" />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={movie.backdrop}
              alt={movie.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
          </div>

          <div className="relative h-full container mx-auto px-4 flex items-end pb-12 md:pb-20">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Poster */}
              <div className="hidden md:block w-56 lg:w-64 flex-shrink-0">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full rounded-lg shadow-2xl"
                />
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-5xl font-bold text-balance">
                  {movie.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-1 bg-primary/20 text-primary px-3 py-1 rounded-full">
                    <Star className="h-4 w-4 fill-primary" />
                    <span className="font-semibold">{movie.rating}/10</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{movie.year}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{movie.duration}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Film className="h-4 w-4" />
                    <span>{movie.category}</span>
                  </div>
                </div>

                <p className="mt-6 text-muted-foreground max-w-2xl leading-relaxed">
                  {movie.description}
                </p>

              </div>
            </div>
          </div>
        </section>

        {/* Content Tabs */}
        <section className="container mx-auto px-4 py-12">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="cast">Cast</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({movie.comments.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-8">
              {/* Available Versions */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Available Versions</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(movie.versions.length ? movie.versions : [{ id: '0', format: 'HD', resolution: '1080p', language: 'Original', available: false }]).map((version, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{version.format}</span>
                        <span className="text-xs px-2 py-1 bg-secondary rounded">
                          {version.resolution}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{version.language}</p>
                      <Button
                        className="w-full mt-3"
                        size="sm"
                        onClick={() => {
                          setSelectedVersionId(version.id)
                          handleWatch(version.id)
                        }}
                      >
                        <Play className="h-4 w-4 mr-2 fill-current" />
                        Watch in {version.language}
                      </Button>
                    </div>
                  ))}
                </div>
                {statusMessage && (
                  <p className="mt-4 text-sm text-muted-foreground">{statusMessage}</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="cast" className="space-y-8">
              {movie.actors.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {movie.actors.map((actor) => (
                    <Link key={actor.id} href={`/actor/${actor.id}`} className="text-center group">
                      <div className="aspect-square rounded-full overflow-hidden bg-secondary mb-3">
                        <img
                          src={actor.photo}
                          alt={actor.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <h4 className="font-medium text-sm">{actor.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{actor.role}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No cast information available.</p>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <div className="p-6 rounded-lg bg-card border border-border space-y-4">
                <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Add your review</h3>
                    <p className="text-sm text-muted-foreground">
                      Votul, comentariul si optiunile bifate se salveaza in baza de date.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={rating}
                      onChange={(event) => setRating(Number(event.target.value))}
                      className="h-9 w-20 rounded-md border border-input bg-background px-3 text-sm"
                    />
                  </div>
                </div>
                <Textarea
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  placeholder="Scrie un comentariu despre film, actori sau prestatia artistica..."
                  className="min-h-28"
                />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {options.map((option) => (
                    <label key={option.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={selectedOptionIds.includes(option.id)}
                        onCheckedChange={() => toggleOption(option.id)}
                      />
                      <span>{option.denumire}</span>
                    </label>
                  ))}
                </div>
                <Button onClick={handleSubmitReview}>Save review</Button>
                {statusMessage && (
                  <p className="text-sm text-muted-foreground">{statusMessage}</p>
                )}
              </div>

              {/* Rating Summary */}
              <div className="flex items-center gap-6 p-6 rounded-lg bg-card border border-border">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">{movie.rating}</div>
                  <div className="flex items-center justify-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(movie.rating / 2)
                            ? 'fill-primary text-primary'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {movie.comments.length} reviews
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Based on viewer ratings and sentiment analysis
                  </p>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {displayedComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 rounded-lg bg-card border border-border"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                        <AvatarFallback>
                          {comment.userName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{comment.userName}</h4>
                            <p className="text-xs text-muted-foreground">{comment.date}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="h-4 w-4 fill-primary text-primary" />
                              <span>{comment.rating}/10</span>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full bg-secondary ${getSentimentColor(
                                comment.sentiment
                              )}`}
                            >
                              {comment.sentiment}
                            </span>
                          </div>
                        </div>
                        <p className="mt-3 text-muted-foreground">{comment.text}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <ThumbsUp className="h-4 w-4" />
                            <span>Helpful</span>
                          </button>
                          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <ThumbsDown className="h-4 w-4" />
                            <span>Not helpful</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {movie.comments.length > 3 && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setShowAllComments(!showAllComments)}
                >
                  {showAllComments ? (
                    <>
                      Show Less
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show All Reviews ({movie.comments.length})
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </TabsContent>
          </Tabs>
        </section>

        {/* Related Movies */}
        {relatedMovies.length > 0 && (
          <section className="container mx-auto px-4 pb-12">
            <MovieRow title={`More ${movie.category} Movies`} movies={relatedMovies} />
          </section>
        )}
      </main>
      <Footer />
      <AuthModal />
    </>
  )
}

export default function MovieDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  return <MovieDetailsContent movieId={id} />
}
