'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Filter, Grid, LayoutGrid, Star, SlidersHorizontal, X } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { AuthModal } from '@/components/auth-modal'
import { MovieCard } from '@/components/movie-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { getMovies, searchMovies as searchMoviesApi, type Movie } from '@/lib/api'

type SortOption = 'rating' | 'year' | 'title'
type ViewMode = 'grid' | 'large'

function BrowseContent() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') || 'all'

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [sortBy, setSortBy] = useState<SortOption>('rating')
  const [viewMode, setViewMode] = useState<ViewMode>('large')
  const [minRating, setMinRating] = useState(0)
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setSelectedCategory(initialCategory)
  }, [initialCategory])

  useEffect(() => {
    let cancelled = false
    const loadMovies = async () => {
      try {
        setIsLoading(true)
        if (searchQuery.trim()) {
          const results = await searchMoviesApi(searchQuery)
          if (!cancelled) setMovies(results)
          return
        }
        const results = await getMovies()
        if (!cancelled) setMovies(results)
      } catch (error) {
        console.error(error)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadMovies()
    return () => {
      cancelled = true
    }
  }, [searchQuery])

  const categories = useMemo(
    () => Array.from(new Set(movies.map((movie) => movie.category))).sort(),
    [movies]
  )

  const years = useMemo(() => {
    const uniqueYears = [...new Set(movies.map((m) => m.year))].sort((a, b) => b - a)
    return uniqueYears
  }, [movies])

  const filteredMovies = useMemo(() => {
    let result = [...movies]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (movie) =>
          movie.title.toLowerCase().includes(query) ||
          movie.description.toLowerCase().includes(query) ||
          movie.actors.some((actor) => actor.name.toLowerCase().includes(query))
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter((movie) => movie.category === selectedCategory)
    }

    // Filter by minimum rating
    if (minRating > 0) {
      result = result.filter((movie) => movie.rating >= minRating)
    }

    // Filter by year
    if (selectedYear !== 'all') {
      result = result.filter((movie) => movie.year === parseInt(selectedYear))
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'year':
        result.sort((a, b) => b.year - a.year)
        break
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    return result
  }, [movies, searchQuery, selectedCategory, sortBy, minRating, selectedYear])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSortBy('rating')
    setMinRating(0)
    setSelectedYear('all')
  }

  const hasActiveFilters =
    searchQuery || selectedCategory !== 'all' || minRating > 0 || selectedYear !== 'all'

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">Browse Movies</h1>
            <p className="mt-2 text-muted-foreground">
              Discover your next favorite movie from our collection
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search movies, actors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="year">Newest</SelectItem>
                  <SelectItem value="title">A-Z</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex items-center border border-border rounded-md">
                <Button
                  variant={viewMode === 'large' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-r-none"
                  onClick={() => setViewMode('large')}
                  aria-label="Large grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-l-none"
                  onClick={() => setViewMode('grid')}
                  aria-label="Small grid view"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rating">Top Rated</SelectItem>
                        <SelectItem value="year">Newest</SelectItem>
                        <SelectItem value="title">A-Z</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Year</label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
                    <div className="flex items-center gap-2">
                      {[0, 7, 8, 9].map((rating) => (
                        <Button
                          key={rating}
                          variant={minRating === rating ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setMinRating(rating)}
                          className="gap-1"
                        >
                          {rating === 0 ? (
                            'Any'
                          ) : (
                            <>
                              <Star className="h-3 w-3 fill-current" />
                              {rating}+
                            </>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedCategory !== 'all' && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1 h-7"
                  onClick={() => setSelectedCategory('all')}
                >
                  {selectedCategory}
                  <X className="h-3 w-3" />
                </Button>
              )}
              {selectedYear !== 'all' && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1 h-7"
                  onClick={() => setSelectedYear('all')}
                >
                  {selectedYear}
                  <X className="h-3 w-3" />
                </Button>
              )}
              {minRating > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1 h-7"
                  onClick={() => setMinRating(0)}
                >
                  Rating {minRating}+
                  <X className="h-3 w-3" />
                </Button>
              )}
              {searchQuery && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1 h-7"
                  onClick={() => setSearchQuery('')}
                >
                  &quot;{searchQuery}&quot;
                  <X className="h-3 w-3" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7">
                Clear all
              </Button>
            </div>
          )}

          {/* Results Count */}
          <p className="text-sm text-muted-foreground mb-6">
            Showing {filteredMovies.length} {filteredMovies.length === 1 ? 'movie' : 'movies'}
          </p>

          {/* Movies Grid */}
          {isLoading ? (
            <div className="text-center py-20">
              <h3 className="text-lg font-medium">Loading movies...</h3>
            </div>
          ) : filteredMovies.length > 0 ? (
            <div
              className={`grid gap-x-4 gap-y-6 ${
                viewMode === 'large'
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
                  : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8'
              }`}
            >
              {filteredMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} variant={viewMode === 'large' ? 'large' : 'default'} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No movies found</h3>
              <p className="text-muted-foreground mt-1">
                Try adjusting your filters or search query
              </p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <AuthModal />
    </>
  )
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <BrowseContent />
    </Suspense>
  )
}
