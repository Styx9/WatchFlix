const BACKEND_ORIGIN = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
const API_PREFIX = '/backend-api'
const FALLBACK_IMAGE = '/placeholder.svg'

type Sentiment = 'positive' | 'neutral' | 'negative'

export interface Actor {
  id: string
  name: string
  photo: string
  role: string
  stageName?: string
  firstName?: string
  lastName?: string
  birthDate?: string | null
}

export interface MovieVersion {
  id: string
  format: string
  resolution: string
  language: string
  available: boolean
}

export interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar: string
  text: string
  rating: number
  sentiment: Sentiment
  date: string
}

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

export interface User {
  id: string
  name: string
  email: string
  username: string
  avatar: string
  memberSince: string
  firstName?: string
  lastName?: string
  homePhone?: string | null
  address?: string | null
  city?: string | null
  mobilePhone?: string | null
}

export interface ClientProfileStats {
  categoriePreferata: string
  actorPreferat: string
  totalFilmeVazute: number
  totalFilmeVotate: number
  ratingMediuAcordat: number
  sentimentDominant: string
}

export interface ClientHistoryItem {
  idVizualizare: number
  idFilm: number
  titlu: string
  categorie: string
  dataVizualizare: string
  versiune: string
  stare: string
  votAcordat: number | null
  comentariu: string | null
  sentiment: string | null
}

interface BackendFilm {
  id: number
  titlu: string
  descriere: string
  idCategorie: number
  categorie?: string | null
  dataLansare: string | null
  rating: number
  posterUrl: string | null
}

interface BackendActor {
  id: number
  numeScena: string | null
  prenume: string | null
  numeFamilie: string | null
  dataNastere: string | null
  poza: string | null
}

interface BackendComment {
  id: number
  idClient: number
  idFilm: number
  textComentariu: string
  dataComentariu: string
  sentiment: string
  username?: string | null
  numeClient?: string | null
}

interface BackendVote {
  id: number
  idClient: number
  idFilm: number
  valoare: number
  dataVot: string
}

interface BackendVersion {
  id: number
  idFilm: number
  rezolutie: string
  limba: string
  format: string | null
  disponibila: boolean
}

interface BackendClient {
  id: number
  username: string
  email: string | null
  nume: string | null
  prenume: string | null
  telefon: string | null
  adresa: string | null
  oras: string | null
  telefonMobil: string | null
}

export interface PredefinedOption {
  id: number
  denumire: string
  tip: string
}

export interface Recommendation {
  id: number
  idClient: number
  idFilm: number
  scorCompatibilitate: number
  motiv: string
  dataGenerare: string
  vizualizata: boolean
}

export interface SeasonalPrediction {
  idFilm: number
  titlu: string
  categorie: string
  vizualizariIstorice: number
  rating: number
  scorPredictie: number
}

const categoryMap: Record<number, string> = {
  1: 'Action',
  2: 'Comedy',
  3: 'Drama',
  4: 'Horror',
  5: 'Sci-Fi',
  6: 'Romance',
  7: 'Thriller',
  8: 'Documentary',
  9: 'Animation',
  10: 'Adventure',
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_PREFIX}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  if (!text) {
    return undefined as T
  }

  return JSON.parse(text) as T
}

export function normalizeImageUrl(url?: string | null): string {
  if (!url) return FALLBACK_IMAGE
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
  if (url.startsWith('/')) return `${BACKEND_ORIGIN}${url}`
  return `${BACKEND_ORIGIN}/${url}`
}

function normalizeSentiment(sentiment: string): Sentiment {
  const value = sentiment.toLowerCase()
  if (value.includes('pozitiv') || value.includes('positive')) return 'positive'
  if (value.includes('negativ') || value.includes('negative')) return 'negative'
  return 'neutral'
}

function mapFilm(film: BackendFilm): Movie {
  const year = film.dataLansare ? new Date(film.dataLansare).getFullYear() : new Date().getFullYear()
  const poster = normalizeImageUrl(film.posterUrl)

  return {
    id: String(film.id),
    title: film.titlu,
    description: film.descriere || 'No description available.',
    year,
    duration: 'N/A',
    rating: Number(film.rating || 0),
    category: film.categorie || categoryMap[film.idCategorie] || `Category ${film.idCategorie}`,
    poster,
    backdrop: poster,
    actors: [],
    versions: [],
    comments: [],
  }
}

function mapVersion(version: BackendVersion): MovieVersion {
  return {
    id: String(version.id),
    format: version.format || version.rezolutie,
    resolution: version.rezolutie,
    language: version.limba,
    available: version.disponibila,
  }
}

function mapClient(client: BackendClient): User {
  const username = client.username || `client${client.id}`
  return {
    id: String(client.id),
    username,
    name: `${client.prenume || ''} ${client.nume || ''}`.trim() || username,
    email: client.email || `${username}@watchflix.local`,
    avatar: FALLBACK_IMAGE,
    memberSince: new Date().toISOString(),
    firstName: client.prenume || '',
    lastName: client.nume || '',
    homePhone: client.telefon,
    address: client.adresa,
    city: client.oras,
    mobilePhone: client.telefonMobil,
  }
}

export async function getMovies(page = 0, size = 500): Promise<Movie[]> {
  const films = await apiFetch<BackendFilm[]>(`/api/filme?page=${page}&size=${size}`)
  return films.map(mapFilm)
}

export async function getPopularMovies(limit = 10): Promise<Movie[]> {
  const popular = await apiFetch<Array<{ idFilm: number }>>(`/api/filme/populare?limit=${limit}`)
  const movies = await Promise.all(popular.map((item) => getMovieDetails(String(item.idFilm))))
  return movies.filter((movie): movie is Movie => !!movie)
}

export async function searchMovies(query: string): Promise<Movie[]> {
  if (!query.trim()) return getMovies()
  const films = await apiFetch<BackendFilm[]>(
    `/api/filme/search?title=${encodeURIComponent(query.trim())}`
  )
  return films.map(mapFilm)
}

export async function getActorsByMovie(movieId: string): Promise<Actor[]> {
  const actors = await apiFetch<BackendActor[]>(`/api/actori/film/${movieId}`)
  return actors.map(mapActor)
}

function mapActor(actor: BackendActor): Actor {
  return {
    id: String(actor.id),
    name:
      actor.numeScena ||
      `${actor.prenume || ''} ${actor.numeFamilie || ''}`.trim() ||
      `Actor ${actor.id}`,
    photo: normalizeImageUrl(actor.poza),
    role: 'Actor',
    stageName: actor.numeScena || undefined,
    firstName: actor.prenume || undefined,
    lastName: actor.numeFamilie || undefined,
    birthDate: actor.dataNastere,
  }
}

export async function getCommentsByMovie(movieId: string): Promise<Comment[]> {
  const [comments, votes] = await Promise.all([
    apiFetch<BackendComment[]>(`/api/comentarii/film/${movieId}`),
    getVotesByMovie(movieId).catch(() => []),
  ])
  const ratingByClient = new Map(votes.map((vote) => [String(vote.idClient), vote.valoare]))

  return comments.map((comment) => ({
    id: String(comment.id),
    userId: String(comment.idClient),
    userName: comment.username || comment.numeClient || `User ${comment.idClient}`,
    userAvatar: FALLBACK_IMAGE,
    text: comment.textComentariu,
    rating: ratingByClient.get(String(comment.idClient)) ?? 0,
    sentiment: normalizeSentiment(comment.sentiment),
    date: comment.dataComentariu,
  }))
}

export async function getVotesByMovie(movieId: string): Promise<BackendVote[]> {
  return apiFetch<BackendVote[]>(`/api/voturi/film/${movieId}`)
}

export async function getVersionsByMovie(movieId: string): Promise<MovieVersion[]> {
  const versions = await apiFetch<BackendVersion[]>(`/api/versiuni/film/${movieId}`)
  return versions.map(mapVersion)
}

export async function getMovieDetails(id: string): Promise<Movie | null> {
  const film = await apiFetch<BackendFilm>(`/api/filme/${id}`)
  const base = mapFilm(film)
  const [actors, comments, versions] = await Promise.all([
    getActorsByMovie(id),
    getCommentsByMovie(id),
    getVersionsByMovie(id),
  ])
  return {
    ...base,
    actors,
    comments,
    versions,
  }
}

export async function login(username: string, parola: string): Promise<User> {
  const client = await apiFetch<BackendClient>(
    `/api/clienti/login?username=${encodeURIComponent(username)}&parola=${encodeURIComponent(parola)}`,
    { method: 'POST' }
  )
  return mapClient(client)
}

export async function register(
  username: string,
  email: string,
  parola: string,
  fullName?: string
): Promise<User> {
  const [prenume = '', ...rest] = (fullName || username).split(' ')
  const nume = rest.join(' ')

  const client = await apiFetch<BackendClient>('/api/clienti/register', {
    method: 'POST',
    body: JSON.stringify({
      username,
      email,
      parola,
      prenume,
      nume,
    }),
  })

  return mapClient({ ...client, email: client.email || email })
}

export async function updateClientProfile(
  clientId: string,
  data: {
    firstName: string
    lastName: string
    homePhone?: string
    address?: string
    city?: string
    email?: string
    mobilePhone?: string
  }
): Promise<User> {
  const client = await apiFetch<BackendClient>(`/api/clienti/${clientId}`, {
    method: 'PUT',
    body: JSON.stringify({
      prenume: data.firstName,
      nume: data.lastName,
      telefon: data.homePhone || null,
      adresa: data.address || null,
      oras: data.city || null,
      email: data.email || null,
      telefonMobil: data.mobilePhone || null,
    }),
  })
  return mapClient(client)
}

export async function getClientProfileStats(clientId: string): Promise<ClientProfileStats> {
  return apiFetch<ClientProfileStats>(`/api/clienti/${clientId}/profil`)
}

export async function getClientHistory(clientId: string): Promise<ClientHistoryItem[]> {
  return apiFetch<ClientHistoryItem[]>(`/api/clienti/${clientId}/istoric`)
}

export async function getClientRecommendations(clientId: string): Promise<Recommendation[]> {
  return apiFetch<Recommendation[]>(`/api/clienti/${clientId}/recomandari`)
}

export async function getClientRecommendationMovies(clientId: string): Promise<Movie[]> {
  const recommendations = await getClientRecommendations(clientId)
  const movies = await Promise.all(
    recommendations
      .filter((recommendation) => !recommendation.vizualizata)
      .slice(0, 12)
      .map((recommendation) => getMovieDetails(String(recommendation.idFilm)).catch(() => null))
  )
  return movies.filter((movie): movie is Movie => !!movie)
}

export async function getActorDetails(actorId: string): Promise<Actor> {
  const actor = await apiFetch<BackendActor>(`/api/actori/${actorId}`)
  return mapActor(actor)
}

export async function getMoviesByActor(actorId: string): Promise<Movie[]> {
  const movies = await apiFetch<BackendFilm[]>(`/api/actori/${actorId}/filme`)
  return movies.map(mapFilm)
}

export async function addWatch(
  clientId: string,
  movieId: string,
  versionId: string,
  status = 'COMPLETA',
  duration = 120
) {
  return apiFetch('/api/vizualizari', {
    method: 'POST',
    body: JSON.stringify({
      idClient: Number(clientId),
      idFilm: Number(movieId),
      idVersiune: Number(versionId),
      durataVizualizata: duration,
      stare: status,
    }),
  })
}

export async function addVote(clientId: string, movieId: string, value: number) {
  await apiFetch(`/api/voturi?idClient=${clientId}&idFilm=${movieId}&valoare=${value}`, {
    method: 'POST',
  })
}

export async function addComment(
  clientId: string,
  movieId: string,
  text: string,
  ratingValue = 0
): Promise<Comment> {
  const comment = await apiFetch<BackendComment>('/api/comentarii', {
    method: 'POST',
    body: JSON.stringify({
      idClient: Number(clientId),
      idFilm: Number(movieId),
      textComentariu: text,
    }),
  })

  return {
    id: String(comment.id),
    userId: String(comment.idClient),
    userName: comment.username || comment.numeClient || `User ${comment.idClient}`,
    userAvatar: FALLBACK_IMAGE,
    text: comment.textComentariu,
    rating: ratingValue,
    sentiment: normalizeSentiment(comment.sentiment),
    date: comment.dataComentariu,
  }
}

export async function getPredefinedOptions(): Promise<PredefinedOption[]> {
  return apiFetch<PredefinedOption[]>('/api/optiuni')
}

export async function saveClientOptions(clientId: string, movieId: string, optionIds: number[]) {
  return apiFetch('/api/optiuni/client', {
    method: 'POST',
    body: JSON.stringify({
      idClient: Number(clientId),
      idFilm: Number(movieId),
      idOptiuni: optionIds,
    }),
  })
}

export async function getSeasonalPredictions(
  lunaStart: number,
  lunaEnd: number,
  limit = 10
): Promise<SeasonalPrediction[]> {
  const rows = await apiFetch<Array<Record<string, unknown>>>(
    `/api/statistici/predictii-sezoniere?lunaStart=${lunaStart}&lunaEnd=${lunaEnd}&limit=${limit}`
  )

  return rows.map((row) => ({
    idFilm: Number(row.id_film ?? row.idFilm),
    titlu: String(row.titlu ?? ''),
    categorie: String(row.categorie ?? ''),
    vizualizariIstorice: Number(row.vizualizari_istorice ?? row.vizualizariIstorice ?? 0),
    rating: Number(row.rating ?? 0),
    scorPredictie: Number(row.scor_predictie ?? row.scorPredictie ?? 0),
  }))
}
