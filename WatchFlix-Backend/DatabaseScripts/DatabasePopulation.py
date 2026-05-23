import pandas as pd
import psycopg2
import json
import random
from datetime import date, timedelta
DB_CONFIG = {
    "host":     "localhost",
    "port":     5432,
    "database": "filme_db",
    "user":     "postgres",
    "password": "password"
}
MOVIES_CSV   = "tmdb_5000_movies.csv"
CREDITS_CSV  = "tmdb_5000_credits.csv"
MAX_FILME    = 500
MAX_ACTORI_PER_FILM = 5
def parse_json_col(val):
    try:
        return json.loads(val.replace("'", '"'))
    except Exception:
        return []

def random_date(start_year=2015, end_year=2024):
    start = date(start_year, 1, 1)
    end   = date(end_year, 12, 31)
    return start + timedelta(days=random.randint(0, (end - start).days))


def split_full_name(full_name):
    parts = full_name.strip().split(" ")
    if len(parts) == 1:
        return parts[0], "Unknown"
    return " ".join(parts[:-1]), parts[-1]
def populate_categorii(cursor, movies_df):
    print(">> Populare CATEGORII...")
    genres_set = set()
    for val in movies_df["genres"]:
        for g in parse_json_col(val):
            genres_set.add(g["name"])
    genre_descriptions = {
        "Action":          "Filme cu scene de actiune, urmariri si lupte",
        "Adventure":       "Filme cu aventuri si calatorii in locuri exotice",
        "Animation":       "Filme animate pentru toate varstele",
        "Comedy":          "Filme care provoaca rasul si buna dispozitie",
        "Crime":           "Filme despre infractiuni si investigatii",
        "Documentary":     "Filme documentare despre subiecte reale",
        "Drama":           "Filme cu povesti emotionante si personaje complexe",
        "Family":          "Filme potrivite pentru intreaga familie",
        "Fantasy":         "Filme cu lumi imaginare si magie",
        "History":         "Filme inspirate din evenimente istorice",
        "Horror":          "Filme de groaza si suspans",
        "Music":           "Filme cu muzica si dans",
        "Mystery":         "Filme cu mistere si enigme de dezlegat",
        "Romance":         "Filme de dragoste si relatii",
        "Science Fiction": "Filme despre viitor, tehnologie si spatiu",
        "Thriller":        "Filme cu tensiune si suspans ridicat",
        "War":             "Filme despre razboaie si conflicte armate",
        "Western":         "Filme despre vestul salbatic american",
        "TV Movie":        "Filme produse special pentru televiziune",
        "Foreign":         "Filme straine din diverse culturi",
    }

    category_id_map = {}
    for genre in sorted(genres_set):
        desc = genre_descriptions.get(genre, f"Filme de tip {genre}")
        cursor.execute(
            """
            INSERT INTO CATEGORII (nume, descriere)
            VALUES (%s, %s)
                ON CONFLICT (nume) DO UPDATE SET descriere = EXCLUDED.descriere
                                          RETURNING id
            """,
            (genre, desc)
        )
        category_id_map[genre] = cursor.fetchone()[0]

    print(f"   {len(category_id_map)} categorii inserate.")
    return category_id_map
def populate_filme(cursor, movies_df, category_id_map):
    print(f">> Populare FILME (primele {MAX_FILME})...")
    film_id_map = {}
    inserted = 0
    for _, row in movies_df.head(MAX_FILME).iterrows():
        genres = parse_json_col(row["genres"])
        if not genres:
            continue
        genre_name   = genres[0]["name"]
        id_categorie = category_id_map.get(genre_name)
        if not id_categorie:
            continue

        titlu        = str(row["title"])[:200]
        descriere    = str(row["overview"])[:2000] if pd.notna(row["overview"]) else None
        data_lansare = None
        if pd.notna(row["release_date"]) and str(row["release_date"]).strip():
            try:
                data_lansare = pd.to_datetime(row["release_date"]).date()
            except Exception:
                pass
        rating = float(row["vote_average"]) if pd.notna(row["vote_average"]) else 0.0
        rating = round(min(max(rating, 0), 10), 2)

        cursor.execute(
            """
            INSERT INTO FILME (titlu, descriere, id_categorie, data_lansare, rating)
            VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """,
            (titlu, descriere, id_categorie, data_lansare, rating)
        )
        db_id = cursor.fetchone()[0]
        film_id_map[int(row["id"])] = db_id
        inserted += 1

    print(f"   {inserted} filme inserate.")
    return film_id_map
def populate_versiuni(cursor, film_id_map):
    print(">> Populare VERSIUNI_FILM...")

    limbi    = ["Romana", "Engleza", "Franceza", "Germana", "Spaniola"]
    formate  = ["Digital", "BluRay", "DVD"]
    inserted = 0

    for db_id in film_id_map.values():
        versiuni = [
            ("HD",  "Romana",  random.choice(formate)),
            ("4K",  "Engleza", "Digital"),
        ]
        if random.random() > 0.5:
            versiuni.append(("SD", random.choice(limbi), "DVD"))

        for rez, limba, fmt in versiuni:
            cursor.execute(
                """
                INSERT INTO VERSIUNI_FILM (id_film, rezolutie, limba, format, disponibila)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (db_id, rez, limba, fmt, "Y")
            )
            inserted += 1

    print(f"   {inserted} versiuni inserate.")
def populate_actori_si_roluri(cursor, credits_df, film_id_map):
    print(">> Populare ACTORI si ROLURI...")

    actor_db_id_map = {}
    roluri_inserted = 0
    actori_inserted = 0

    for _, row in credits_df.iterrows():
        tmdb_movie_id = int(row["movie_id"])
        if tmdb_movie_id not in film_id_map:
            continue

        db_film_id = film_id_map[tmdb_movie_id]
        cast       = parse_json_col(row["cast"])
        cast_sorted = sorted(cast, key=lambda x: x.get("order", 99))[:MAX_ACTORI_PER_FILM]

        for i, member in enumerate(cast_sorted):
            tmdb_actor_id = member.get("id")
            full_name     = member.get("name", "Unknown Actor")
            prenume, nume_familie = split_full_name(full_name)
            if tmdb_actor_id not in actor_db_id_map:
                data_nastere = date(
                    random.randint(1950, 1995),
                    random.randint(1, 12),
                    random.randint(1, 28)
                )
                cursor.execute(
                    """
                    INSERT INTO ACTORI (nume_scena, prenume, nume_familie, data_nastere)
                    VALUES (%s, %s, %s, %s)
                        RETURNING id
                    """,
                    (full_name, prenume, nume_familie, data_nastere)
                )
                db_actor_id = cursor.fetchone()[0]
                actor_db_id_map[tmdb_actor_id] = db_actor_id
                actori_inserted += 1
            else:
                db_actor_id = actor_db_id_map[tmdb_actor_id]
            tip_rol = "Principal" if i == 0 else "Secundar"
            try:
                cursor.execute(
                    """
                    INSERT INTO ROLURI (id_film, id_actor, tip_rol, comentariu_rol)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (db_film_id, db_actor_id, tip_rol, None)
                )
                roluri_inserted += 1
            except psycopg2.errors.UniqueViolation:
                cursor.connection.rollback()  # rollback savepoint
    print(f"   {actori_inserted} actori inserati, {roluri_inserted} roluri inserate.")
def populate_clienti(cursor):
    print(">> Populare CLIENTI...")

    nume_list    = ["Popescu", "Ionescu", "Popa", "Constantin", "Gheorghe",
                    "Stoica", "Dumitrescu", "Stan", "Marin", "Florea"]
    prenume_list = ["Alexandru", "Andrei", "Maria", "Elena", "Mihai",
                    "Cristina", "Daniel", "Ana", "Bogdan", "Ioana",
                    "Radu", "Laura", "Vlad", "Simona", "George"]
    orase        = ["Bucuresti", "Cluj-Napoca", "Iasi", "Timisoara",
                    "Brasov", "Constanta", "Craiova", "Galati"]

    clienti_ids = []
    for i in range(1, 31):
        prenume = random.choice(prenume_list)
        nume    = random.choice(nume_list)
        oras    = random.choice(orase)
        email   = f"{prenume.lower()}.{nume.lower()}{i}@email.com"

        username = f"{prenume.lower()}.{nume.lower()}{i}"
        parola_hash = "$2a$10$7QDwTXUjeJx63WWaE3wqE.XPxsFPco58Fgh0rNvvd83Uk1X5grvY."

        cursor.execute(
            """
            INSERT INTO CLIENTI (username, parola, nume, prenume, telefon, adresa, oras, email, telefon_mobil)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """,
            (
                username,
                parola_hash,
                nume,
                prenume,
                f"021{random.randint(1000000, 9999999)}",
                f"Strada {random.choice(['Victoriei', 'Unirii', 'Libertatii'])} nr.{random.randint(1,100)}",
                oras,
                email,
                f"07{random.randint(10000000, 99999999)}"
            )
        )
        clienti_ids.append(cursor.fetchone()[0])

    print(f"   {len(clienti_ids)} clienti inserati.")
    return clienti_ids
def populate_vizualizari(cursor, clienti_ids, film_id_map):
    print(">> Populare VIZUALIZARI...")

    film_db_ids = list(film_id_map.values())
    inserted    = 0

    for client_id in clienti_ids:
        filme_vazute = random.sample(film_db_ids, min(random.randint(5, 15), len(film_db_ids)))
        for film_id in filme_vazute:
            cursor.execute(
                "SELECT id FROM VERSIUNI_FILM WHERE id_film = %s LIMIT 1",
                (film_id,)
            )
            row = cursor.fetchone()
            if not row:
                continue
            versiune_id = row[0]

            stare   = random.choice(["COMPLETA", "INCOMPLETA"])
            durata  = random.randint(60, 180) if stare == "COMPLETA" else random.randint(10, 59)

            cursor.execute(
                """
                INSERT INTO VIZUALIZARI
                (id_client, id_film, id_versiune, data_vizualizare, durata_vizualizata, stare)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (client_id, film_id, versiune_id, random_date(), durata, stare)
            )
            inserted += 1

    print(f"   {inserted} vizualizari inserate.")
def populate_voturi(cursor, clienti_ids, film_id_map):
    print(">> Populare VOTURI...")

    film_db_ids = list(film_id_map.values())
    inserted    = 0

    for client_id in clienti_ids:
        filme_votate = random.sample(film_db_ids, min(random.randint(3, 10), len(film_db_ids)))
        for film_id in filme_votate:
            valoare = random.randint(1, 10)
            try:
                cursor.execute(
                    """
                    INSERT INTO VOTURI (id_client, id_film, valoare, data_vot)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (client_id, film_id, valoare, random_date())
                )
                inserted += 1
            except psycopg2.errors.UniqueViolation:
                cursor.connection.rollback()

    print(f"   {inserted} voturi inserate.")
def populate_comentarii(cursor, clienti_ids, film_id_map):
    print(">> Populare COMENTARII...")

    comentarii_pozitive = [
        "Film extraordinar, l-am vazut de doua ori!",
        "Regie impecabila si actorie de exceptie.",
        "Unul dintre cele mai bune filme vazute vreodata.",
        "Povestea m-a captivat din primul minut.",
        "Recomandat cu caldura tuturor!",
        "Efectele vizuale sunt spectaculoase.",
        "Coloana sonora este minunata.",
    ]
    comentarii_negative = [
        "Nu m-a impresionat deloc, sub asteptari.",
        "Scenariul este slab si previzibil.",
        "Prea lung si plictisitor pe alocuri.",
        "Actoria lasa de dorit.",
        "Nu as recomanda acest film.",
        "M-am plictisit dupa primele 20 de minute.",
    ]
    comentarii_neutre = [
        "Un film ok, nici bun nici rau.",
        "Merită văzut o dată.",
        "Interesant dar nu exceptional.",
        "Destul de bun pentru genul sau.",
    ]
    film_db_ids = list(film_id_map.values())
    inserted    = 0
    for client_id in random.sample(clienti_ids, min(20, len(clienti_ids))):
        filme_comentate = random.sample(film_db_ids, min(random.randint(1, 4), len(film_db_ids)))
        for film_id in filme_comentate:
            sentiment = random.choice(["POZITIV", "NEGATIV", "NEUTRU"])
            if sentiment == "POZITIV":
                text = random.choice(comentarii_pozitive)
            elif sentiment == "NEGATIV":
                text = random.choice(comentarii_negative)
            else:
                text = random.choice(comentarii_neutre)

            cursor.execute(
                """
                INSERT INTO COMENTARII (id_client, id_film, text_comentariu, data_comentariu, sentiment)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (client_id, film_id, text, random_date(), sentiment)
            )
            inserted += 1

    print(f"   {inserted} comentarii inserate.")
def populate_optiuni_predefinite(cursor):
    print(">> Populare OPTIUNI_PREDEFINITE...")

    optiuni = [
        ("Mi-a placut",           "POZITIV"),
        ("As recomanda",          "POZITIV"),
        ("As mai viziona",        "POZITIV"),
        ("Interesant",            "POZITIV"),
        ("Emotionant",            "POZITIV"),
        ("Actor principal apreciat", "POZITIV"),
        ("Nu mi-a placut",        "NEGATIV"),
        ("Scenariu slab",         "NEGATIV"),
        ("Plictisitor",           "NEGATIV"),
        ("Nu as recomanda",       "NEGATIV"),
        ("Prea lung",             "NEGATIV"),
        ("Ok",                    "NEUTRU"),
        ("Merită vazut",          "NEUTRU"),
    ]

    optiune_ids = []
    for denumire, tip in optiuni:
        cursor.execute(
            """
            INSERT INTO OPTIUNI_PREDEFINITE (denumire, tip)
            VALUES (%s, %s)
                ON CONFLICT (denumire) DO UPDATE SET tip = EXCLUDED.tip
                                              RETURNING id
            """,
            (denumire, tip)
        )
        optiune_ids.append(cursor.fetchone()[0])

    print(f"   {len(optiune_ids)} optiuni inserate.")
    return optiune_ids
def populate_client_optiuni(cursor, clienti_ids, film_id_map, optiune_ids):
    print(">> Populare CLIENT_OPTIUNI...")

    film_db_ids = list(film_id_map.values())
    inserted    = 0

    for client_id in random.sample(clienti_ids, min(15, len(clienti_ids))):
        filme_alese = random.sample(film_db_ids, min(3, len(film_db_ids)))
        for film_id in filme_alese:
            optiuni_alese = random.sample(optiune_ids, min(random.randint(1, 3), len(optiune_ids)))
            for opt_id in optiuni_alese:
                try:
                    cursor.execute(
                        """
                        INSERT INTO CLIENT_OPTIUNI (id_client, id_film, id_optiune, data)
                        VALUES (%s, %s, %s, %s)
                        """,
                        (client_id, film_id, opt_id, random_date())
                    )
                    inserted += 1
                except psycopg2.errors.UniqueViolation:
                    cursor.connection.rollback()

    print(f"   {inserted} optiuni client inserate.")
def main():
    print("=" * 55)
    print("  POPULARE BAZA DE DATE - PLATFORMA FILME")
    print("=" * 55)

    print("\n>> Citire fisiere CSV...")
    movies_df  = pd.read_csv(MOVIES_CSV)
    credits_df = pd.read_csv(CREDITS_CSV)
    print(f"   {len(movies_df)} filme gasite in CSV.")

    # Conectare la baza de date
    print("\n>> Conectare la PostgreSQL...")
    conn = psycopg2.connect(**DB_CONFIG)
    conn.autocommit = False
    cursor = conn.cursor()
    print("   Conectat cu succes!")

    try:
        category_id_map = populate_categorii(cursor, movies_df)
        conn.commit()

        film_id_map = populate_filme(cursor, movies_df, category_id_map)
        conn.commit()

        populate_versiuni(cursor, film_id_map)
        conn.commit()

        populate_actori_si_roluri(cursor, credits_df, film_id_map)
        conn.commit()

        clienti_ids = populate_clienti(cursor)
        conn.commit()

        populate_vizualizari(cursor, clienti_ids, film_id_map)
        conn.commit()

        populate_voturi(cursor, clienti_ids, film_id_map)
        conn.commit()

        populate_comentarii(cursor, clienti_ids, film_id_map)
        conn.commit()

        optiune_ids = populate_optiuni_predefinite(cursor)
        conn.commit()

        populate_client_optiuni(cursor, clienti_ids, film_id_map, optiune_ids)
        conn.commit()

        print("\n" + "=" * 55)
        print("  POPULARE FINALIZATA CU SUCCES!")
        print("=" * 55)

        print("\n>> Sumar inregistrari:")
        tabele = [
            "CATEGORII", "FILME", "VERSIUNI_FILM", "ACTORI", "ROLURI",
            "CLIENTI", "VIZUALIZARI", "VOTURI", "COMENTARII",
            "OPTIUNI_PREDEFINITE", "CLIENT_OPTIUNI"
        ]
        for tabel in tabele:
            cursor.execute(f"SELECT COUNT(*) FROM {tabel}")
            count = cursor.fetchone()[0]
            print(f"   {tabel:<25} {count:>5} inregistrari")

    except Exception as e:
        conn.rollback()
        print(f"\n!! EROARE: {e}")
        raise
    finally:
        cursor.close()
        conn.close()
        print("\n>> Conexiune inchisa.")

if __name__ == "__main__":
    main()
