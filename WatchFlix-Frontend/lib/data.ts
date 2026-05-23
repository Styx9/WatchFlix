export interface Movie {
  id: string
  title: string
  description: string
  year: number
  duration: string
  rating: number
  category: string
  poster: string
  backdrop: string
  actors: Actor[]
  versions: MovieVersion[]
  comments: Comment[]
}

export interface Actor {
  id: string
  name: string
  photo: string
  role: string
}

export interface MovieVersion {
  format: string
  resolution: string
  language: string
}

export interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar: string
  text: string
  rating: number
  sentiment: 'positive' | 'neutral' | 'negative'
  date: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  memberSince: string
  watchHistory: WatchHistoryItem[]
  favorites: string[]
  preferences: {
    categories: string[]
    notifications: boolean
  }
}

export interface WatchHistoryItem {
  movieId: string
  watchedAt: string
  progress: number
}

export const categories = [
  'Action',
  'Comedy',
  'Drama',
  'Horror',
  'Sci-Fi',
  'Romance',
  'Thriller',
  'Documentary',
  'Animation',
  'Adventure',
]

export const movies: Movie[] = [
  {
    id: '1',
    title: 'The Last Horizon',
    description: 'In a world where humanity faces extinction, a group of survivors must journey across desolate landscapes to find the last safe haven. Along the way, they discover secrets about their past that could change everything.',
    year: 2024,
    duration: '2h 15min',
    rating: 8.7,
    category: 'Sci-Fi',
    poster: '/placeholder.svg?height=450&width=300',
    backdrop: '/placeholder.svg?height=600&width=1200',
    actors: [
      { id: 'a1', name: 'Michael Torres', photo: '/placeholder.svg?height=150&width=150', role: 'Commander Reed' },
      { id: 'a2', name: 'Sarah Chen', photo: '/placeholder.svg?height=150&width=150', role: 'Dr. Maya Lin' },
      { id: 'a3', name: 'James Wright', photo: '/placeholder.svg?height=150&width=150', role: 'Captain Blake' },
    ],
    versions: [
      { format: 'HD', resolution: '1080p', language: 'English' },
      { format: '4K', resolution: '2160p', language: 'English' },
      { format: 'HD', resolution: '1080p', language: 'Romanian' },
    ],
    comments: [
      { id: 'c1', userId: 'u1', userName: 'Alex M.', userAvatar: '/placeholder.svg?height=40&width=40', text: 'Absolutely stunning visuals and a gripping storyline!', rating: 9, sentiment: 'positive', date: '2024-03-15' },
      { id: 'c2', userId: 'u2', userName: 'Diana R.', userAvatar: '/placeholder.svg?height=40&width=40', text: 'The ending left me wanting more. Great performances!', rating: 8, sentiment: 'positive', date: '2024-03-14' },
    ],
  },
  {
    id: '2',
    title: 'Midnight in Paris',
    description: 'A romantic comedy that follows a screenwriter who mysteriously finds himself transported back to 1920s Paris every night at midnight, where he encounters legendary artists and writers.',
    year: 2023,
    duration: '1h 54min',
    rating: 8.2,
    category: 'Romance',
    poster: '/placeholder.svg?height=450&width=300',
    backdrop: '/placeholder.svg?height=600&width=1200',
    actors: [
      { id: 'a4', name: 'Emma Stone', photo: '/placeholder.svg?height=150&width=150', role: 'Claire' },
      { id: 'a5', name: 'Ryan Mitchell', photo: '/placeholder.svg?height=150&width=150', role: 'Gil' },
    ],
    versions: [
      { format: 'HD', resolution: '1080p', language: 'English' },
      { format: 'HD', resolution: '1080p', language: 'French' },
    ],
    comments: [
      { id: 'c3', userId: 'u3', userName: 'Maria K.', userAvatar: '/placeholder.svg?height=40&width=40', text: 'Such a charming and whimsical film!', rating: 9, sentiment: 'positive', date: '2024-03-10' },
    ],
  },
  {
    id: '3',
    title: 'Dark Waters',
    description: 'A corporate defense attorney takes on an environmental lawsuit against a chemical company that exposes a lengthy history of pollution.',
    year: 2024,
    duration: '2h 6min',
    rating: 7.9,
    category: 'Thriller',
    poster: '/placeholder.svg?height=450&width=300',
    backdrop: '/placeholder.svg?height=600&width=1200',
    actors: [
      { id: 'a6', name: 'Mark Ruffalo', photo: '/placeholder.svg?height=150&width=150', role: 'Robert Bilott' },
      { id: 'a7', name: 'Anne Hathaway', photo: '/placeholder.svg?height=150&width=150', role: 'Sarah Bilott' },
    ],
    versions: [
      { format: 'HD', resolution: '1080p', language: 'English' },
      { format: '4K', resolution: '2160p', language: 'English' },
    ],
    comments: [
      { id: 'c4', userId: 'u4', userName: 'John D.', userAvatar: '/placeholder.svg?height=40&width=40', text: 'Important story, well told.', rating: 8, sentiment: 'positive', date: '2024-03-08' },
    ],
  },
  {
    id: '4',
    title: 'Comedy Night',
    description: 'A struggling comedian gets a chance at fame when she lands a spot on a late-night talk show, but the pressure threatens to destroy everything she has worked for.',
    year: 2024,
    duration: '1h 42min',
    rating: 7.5,
    category: 'Comedy',
    poster: '/placeholder.svg?height=450&width=300',
    backdrop: '/placeholder.svg?height=600&width=1200',
    actors: [
      { id: 'a8', name: 'Tiffany Haddish', photo: '/placeholder.svg?height=150&width=150', role: 'Jackie' },
      { id: 'a9', name: 'Kevin Hart', photo: '/placeholder.svg?height=150&width=150', role: 'Marcus' },
    ],
    versions: [
      { format: 'HD', resolution: '1080p', language: 'English' },
    ],
    comments: [
      { id: 'c5', userId: 'u5', userName: 'Pete L.', userAvatar: '/placeholder.svg?height=40&width=40', text: 'Hilarious! Laughed throughout.', rating: 8, sentiment: 'positive', date: '2024-03-05' },
    ],
  },
  {
    id: '5',
    title: 'The Silent Forest',
    description: 'A horror film about a family that moves to a remote cabin in the woods, only to discover that the forest is home to something ancient and terrifying.',
    year: 2024,
    duration: '1h 58min',
    rating: 7.8,
    category: 'Horror',
    poster: '/placeholder.svg?height=450&width=300',
    backdrop: '/placeholder.svg?height=600&width=1200',
    actors: [
      { id: 'a10', name: 'Florence Pugh', photo: '/placeholder.svg?height=150&width=150', role: 'Emily' },
      { id: 'a11', name: 'Oscar Isaac', photo: '/placeholder.svg?height=150&width=150', role: 'Daniel' },
    ],
    versions: [
      { format: 'HD', resolution: '1080p', language: 'English' },
      { format: '4K', resolution: '2160p', language: 'English' },
    ],
    comments: [
      { id: 'c6', userId: 'u6', userName: 'Lisa S.', userAvatar: '/placeholder.svg?height=40&width=40', text: 'Genuinely scary. Could not sleep after watching!', rating: 8, sentiment: 'positive', date: '2024-03-01' },
    ],
  },
  {
    id: '6',
    title: 'Steel Warriors',
    description: 'An action-packed thriller following an elite team of soldiers on a mission to prevent a global catastrophe.',
    year: 2024,
    duration: '2h 22min',
    rating: 8.1,
    category: 'Action',
    poster: '/placeholder.svg?height=450&width=300',
    backdrop: '/placeholder.svg?height=600&width=1200',
    actors: [
      { id: 'a12', name: 'Chris Hemsworth', photo: '/placeholder.svg?height=150&width=150', role: 'Colonel Stone' },
      { id: 'a13', name: 'Gal Gadot', photo: '/placeholder.svg?height=150&width=150', role: 'Agent Vega' },
    ],
    versions: [
      { format: 'HD', resolution: '1080p', language: 'English' },
      { format: '4K', resolution: '2160p', language: 'English' },
      { format: 'HD', resolution: '1080p', language: 'Spanish' },
    ],
    comments: [
      { id: 'c7', userId: 'u7', userName: 'Mike R.', userAvatar: '/placeholder.svg?height=40&width=40', text: 'Non-stop action from start to finish!', rating: 9, sentiment: 'positive', date: '2024-02-28' },
    ],
  },
  {
    id: '7',
    title: 'The Great Journey',
    description: 'A documentary following a group of wildlife photographers as they travel across five continents to capture the most endangered species on Earth.',
    year: 2024,
    duration: '1h 45min',
    rating: 9.0,
    category: 'Documentary',
    poster: '/placeholder.svg?height=450&width=300',
    backdrop: '/placeholder.svg?height=600&width=1200',
    actors: [],
    versions: [
      { format: '4K', resolution: '2160p', language: 'English' },
    ],
    comments: [
      { id: 'c8', userId: 'u8', userName: 'Emma W.', userAvatar: '/placeholder.svg?height=40&width=40', text: 'Breathtaking cinematography. A must-watch!', rating: 10, sentiment: 'positive', date: '2024-02-25' },
    ],
  },
  {
    id: '8',
    title: 'Echoes of Tomorrow',
    description: 'A drama about a musician who loses her hearing and must find a new way to connect with her passion and the world around her.',
    year: 2023,
    duration: '2h 8min',
    rating: 8.5,
    category: 'Drama',
    poster: '/placeholder.svg?height=450&width=300',
    backdrop: '/placeholder.svg?height=600&width=1200',
    actors: [
      { id: 'a14', name: 'Saoirse Ronan', photo: '/placeholder.svg?height=150&width=150', role: 'Clara' },
      { id: 'a15', name: 'Timothee Chalamet', photo: '/placeholder.svg?height=150&width=150', role: 'Leo' },
    ],
    versions: [
      { format: 'HD', resolution: '1080p', language: 'English' },
      { format: 'HD', resolution: '1080p', language: 'German' },
    ],
    comments: [
      { id: 'c9', userId: 'u9', userName: 'Sophie T.', userAvatar: '/placeholder.svg?height=40&width=40', text: 'Emotionally powerful. Brought me to tears.', rating: 9, sentiment: 'positive', date: '2024-02-20' },
    ],
  },
]

export const featuredMovie = movies[0]

export const currentUser: User = {
  id: 'u1',
  name: 'Alexandru Popescu',
  email: 'alex.popescu@email.com',
  avatar: '/placeholder.svg?height=120&width=120',
  memberSince: '2022-06-15',
  watchHistory: [
    { movieId: '1', watchedAt: '2024-03-15', progress: 100 },
    { movieId: '2', watchedAt: '2024-03-14', progress: 75 },
    { movieId: '5', watchedAt: '2024-03-10', progress: 100 },
    { movieId: '6', watchedAt: '2024-03-08', progress: 50 },
  ],
  favorites: ['1', '3', '7'],
  preferences: {
    categories: ['Sci-Fi', 'Action', 'Thriller'],
    notifications: true,
  },
}

export function getMovieById(id: string): Movie | undefined {
  return movies.find((movie) => movie.id === id)
}

export function getMoviesByCategory(category: string): Movie[] {
  return movies.filter((movie) => movie.category === category)
}

export function searchMovies(query: string): Movie[] {
  const lowerQuery = query.toLowerCase()
  return movies.filter(
    (movie) =>
      movie.title.toLowerCase().includes(lowerQuery) ||
      movie.description.toLowerCase().includes(lowerQuery) ||
      movie.actors.some((actor) => actor.name.toLowerCase().includes(lowerQuery))
  )
}
