'use client'

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  User,
  Clock,
  Film,
  Calendar,
  Play,
  Star,
  Sparkles,
  Save,
  BarChart3,
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { AuthModal } from '@/components/auth-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/lib/auth-context'
import {
  getClientHistory,
  getClientProfileStats,
  getMovieDetails,
  type ClientHistoryItem,
  type ClientProfileStats,
  type Movie,
  type Recommendation,
  getClientRecommendations,
  getSeasonalPredictions,
  updateClientProfile,
  type SeasonalPrediction,
} from '@/lib/api'

function ProfileContent() {
  const searchParams = useSearchParams()
  const { isAuthenticated, openAuthModal, user, updateUser } = useAuth()
  const [history, setHistory] = useState<ClientHistoryItem[]>([])
  const [stats, setStats] = useState<ClientProfileStats | null>(null)
  const [recommendations, setRecommendations] = useState<Array<{ item: Recommendation; movie: Movie | null }>>([])
  const [seasonalPredictions, setSeasonalPredictions] = useState<SeasonalPrediction[]>([])
  const [selectedSeason, setSelectedSeason] = useState('Sarbatori')
  const [profileStatus, setProfileStatus] = useState('')
  const [contactForm, setContactForm] = useState({
    firstName: '',
    lastName: '',
    homePhone: '',
    address: '',
    city: '',
    email: '',
    mobilePhone: '',
  })

  const defaultTab = searchParams.get('tab') || 'overview'

  useEffect(() => {
    if (!user) return
    setContactForm({
      firstName: user.firstName || user.name.split(' ')[0] || '',
      lastName: user.lastName || user.name.split(' ').slice(1).join(' ') || '',
      homePhone: user.homePhone || '',
      address: user.address || '',
      city: user.city || '',
      email: user.email || '',
      mobilePhone: user.mobilePhone || '',
    })
  }, [user])

  useEffect(() => {
    if (!user?.id) return
    const load = async () => {
      try {
        const [historyData, profileStats, recommendationData] = await Promise.all([
          getClientHistory(user.id),
          getClientProfileStats(user.id),
          getClientRecommendations(user.id).catch(() => []),
        ])
        const recommendationMovies = await Promise.all(
          recommendationData.slice(0, 10).map(async (item) => ({
            item,
            movie: await getMovieDetails(String(item.idFilm)).catch(() => null),
          }))
        )
        setHistory(historyData)
        setStats(profileStats)
        setRecommendations(recommendationMovies)
      } catch (error) {
        console.error(error)
      }
    }
    load()
  }, [user?.id])

  const loadSeasonalPredictions = async (label: string, lunaStart: number, lunaEnd: number) => {
    setSelectedSeason(label)
    try {
      setSeasonalPredictions(await getSeasonalPredictions(lunaStart, lunaEnd, 10))
    } catch (error) {
      console.error(error)
      setSeasonalPredictions([])
    }
  }

  useEffect(() => {
    loadSeasonalPredictions('Sarbatori', 12, 12)
  }, [])

  const handleContactSave = async () => {
    if (!user?.id) return
    try {
      const updatedUser = await updateClientProfile(user.id, contactForm)
      updateUser(updatedUser)
      setProfileStatus('Datele de contact au fost salvate.')
    } catch (error) {
      console.error(error)
      setProfileStatus('Datele nu au putut fi salvate.')
    }
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-20">
          <div className="container mx-auto px-4 py-20 text-center">
            <User className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-2xl font-bold mb-2">Sign in to view your profile</h1>
            <p className="text-muted-foreground mb-6">
              Access your watch history, favorites, and personalized settings
            </p>
            <Button onClick={() => openAuthModal('login')}>Sign In</Button>
          </div>
        </main>
        <Footer />
        <AuthModal />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 p-6 rounded-lg bg-card border border-border">
            <Avatar className="h-24 w-24 border-4 border-primary">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="text-2xl">
                {(user?.name || 'U')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <p className="text-muted-foreground">@{user?.username}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Member since {new Date(user?.memberSince || Date.now()).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Film className="h-4 w-4" />
                  {stats?.totalFilmeVazute ?? history.length} movies watched
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="mb-8 w-full justify-start overflow-x-auto">
              <TabsTrigger value="overview" className="gap-2">
                <User className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <Clock className="h-4 w-4" />
                Watch History
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Recommendations
              </TabsTrigger>
              <TabsTrigger value="predictions" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Seasonal Predictions
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-card border border-border">
                  <div className="text-3xl font-bold text-primary">
                    {stats?.totalFilmeVazute ?? history.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Movies Watched</div>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border">
                  <div className="text-3xl font-bold text-primary">
                    {stats?.totalFilmeVotate ?? 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Movies Rated</div>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border">
                  <div className="text-3xl font-bold text-primary">
                    {stats?.ratingMediuAcordat?.toFixed(1) ?? '0.0'}
                  </div>
                  <div className="text-sm text-muted-foreground">Average Rating Given</div>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border">
                  <div className="text-3xl font-bold text-primary">
                    {stats?.sentimentDominant || 'neutral'}
                  </div>
                  <div className="text-sm text-muted-foreground">Dominant Sentiment</div>
                </div>
              </div>

              {/* Continue Watching */}
              {history.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {history
                      .slice(0, 3)
                      .map((item) => (
                        <Link
                          key={`${item.idFilm}-${item.dataVizualizare}`}
                          href={`/movie/${item.idFilm}`}
                          className="flex gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                        >
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="font-medium line-clamp-1">{item.titlu}</h4>
                              <p className="text-sm text-muted-foreground">
                                {item.versiune} - {item.stare}
                              </p>
                            </div>
                            <div>
                              <Progress value={100} className="h-1 mb-1" />
                              <p className="text-xs text-muted-foreground">
                                Watched {new Date(item.dataVizualizare).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              )}

              {/* Favorite Genres */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Your Profile Insights</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Preferred Category: {stats?.categoriePreferata || 'N/A'}
                  </span>
                  <span className="px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Favorite Actor: {stats?.actorPreferat || 'N/A'}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="grid md:grid-cols-2 gap-4 p-4 rounded-lg bg-card border border-border">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prenume</Label>
                    <Input
                      id="firstName"
                      value={contactForm.firstName}
                      onChange={(event) => setContactForm({ ...contactForm, firstName: event.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nume</Label>
                    <Input
                      id="lastName"
                      value={contactForm.lastName}
                      onChange={(event) => setContactForm({ ...contactForm, lastName: event.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="homePhone">Telefon acasa</Label>
                    <Input
                      id="homePhone"
                      value={contactForm.homePhone}
                      onChange={(event) => setContactForm({ ...contactForm, homePhone: event.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobilePhone">Telefon mobil</Label>
                    <Input
                      id="mobilePhone"
                      value={contactForm.mobilePhone}
                      onChange={(event) => setContactForm({ ...contactForm, mobilePhone: event.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactForm.email}
                      onChange={(event) => setContactForm({ ...contactForm, email: event.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Oras</Label>
                    <Input
                      id="city"
                      value={contactForm.city}
                      onChange={(event) => setContactForm({ ...contactForm, city: event.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Adresa</Label>
                    <Input
                      id="address"
                      value={contactForm.address}
                      onChange={(event) => setContactForm({ ...contactForm, address: event.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center gap-3">
                    <Button className="gap-2" onClick={handleContactSave}>
                      <Save className="h-4 w-4" />
                      Save Contact Data
                    </Button>
                    {profileStatus && (
                      <span className="text-sm text-muted-foreground">{profileStatus}</span>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Watch History Tab */}
            <TabsContent value="history" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Watch History</h3>
              </div>

              {history.length > 0 ? (
                <div className="space-y-3">
                  {history.map((item, index) => (
                    <div
                      key={`${item.idFilm}-${index}`}
                      className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex-1">
                        <Link
                          href={`/movie/${item.idFilm}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {item.titlu}
                        </Link>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{item.categorie}</span>
                          <span>{item.versiune}</span>
                          <span>{item.stare}</span>
                          {typeof item.votAcordat === 'number' && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-primary text-primary" />
                              {item.votAcordat}
                            </span>
                          )}
                        </div>
                        <div className="mt-2">
                          <Progress value={100} className="h-1 w-48" />
                          <p className="text-xs text-muted-foreground mt-1">
                            Watched on {new Date(item.dataVizualizare).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Link href={`/movie/${item.idFilm}`}>
                        <Button size="icon" variant="ghost">
                          <Play className="h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No watch history yet</h3>
                  <p className="text-muted-foreground mt-1">Start watching to build your history</p>
                  <Link href="/browse">
                    <Button className="mt-4">Browse Movies</Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <h3 className="text-lg font-semibold">Recommended For You</h3>
              {recommendations.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.map(({ item, movie }) => (
                    <Link
                      key={item.id}
                      href={`/movie/${item.idFilm}`}
                      className="block p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-medium">{movie?.title || `Movie #${item.idFilm}`}</h4>
                          <p className="mt-1 text-sm text-muted-foreground">{item.motiv}</p>
                        </div>
                        <span className="text-sm font-semibold text-primary">
                          {item.scorCompatibilitate}%
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No recommendations yet</h3>
                  <p className="text-muted-foreground mt-1">
                    Watch a few movies so the database can build your profile.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="predictions" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">Seasonal Viewing Predictions</h3>
                <div className="flex flex-wrap gap-2">
                  <Button variant={selectedSeason === 'Sarbatori' ? 'default' : 'outline'} size="sm" onClick={() => loadSeasonalPredictions('Sarbatori', 12, 12)}>
                    Sarbatori
                  </Button>
                  <Button variant={selectedSeason === 'Vacanta vara' ? 'default' : 'outline'} size="sm" onClick={() => loadSeasonalPredictions('Vacanta vara', 6, 8)}>
                    Vacanta vara
                  </Button>
                  <Button variant={selectedSeason === 'Halloween' ? 'default' : 'outline'} size="sm" onClick={() => loadSeasonalPredictions('Halloween', 10, 10)}>
                    Halloween
                  </Button>
                  <Button variant={selectedSeason === 'Februarie' ? 'default' : 'outline'} size="sm" onClick={() => loadSeasonalPredictions('Februarie', 2, 2)}>
                    Februarie
                  </Button>
                </div>
              </div>

              {seasonalPredictions.length > 0 ? (
                <div className="space-y-3">
                  {seasonalPredictions.map((prediction) => (
                    <Link
                      key={prediction.idFilm}
                      href={`/movie/${prediction.idFilm}`}
                      className="block p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-medium">{prediction.titlu}</h4>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {prediction.categorie} | Vizualizari istorice: {prediction.vizualizariIstorice} | Rating: {prediction.rating}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-primary">
                          {prediction.scorPredictie.toFixed(1)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No prediction data yet</h3>
                  <p className="text-muted-foreground mt-1">
                    The database function uses previous views, categories, ratings and reactions.
                  </p>
                </div>
              )}
            </TabsContent>

          </Tabs>
        </div>
      </main>
      <Footer />
      <AuthModal />
    </>
  )
}

function ProfilePageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ProfileContent />
    </Suspense>
  )
}

export default function ProfilePage() {
  return <ProfilePageWrapper />
}
