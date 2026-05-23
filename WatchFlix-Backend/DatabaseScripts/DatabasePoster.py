import psycopg2
import requests
import pandas as pd
import time
DB_CONFIG = {
    "host":     "localhost",
    "port":     5432,
    "database": "filme_db",
    "user":     "postgres",
    "password": "password"
}

TMDB_API_KEY = "0720869574603b8ccba8c2a24fd80ec8"
MOVIES_CSV   = "tmdb_5000_movies.csv"

TMDB_BASE_URL    = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE  = "https://image.tmdb.org/t/p/w500"

def main():
    print("=" * 55)
    print("  POPULARE POSTER_URL - PLATFORMA FILME")
    print("=" * 55)
    print("\n>> Citire fisier CSV...")
    movies_df = pd.read_csv(MOVIES_CSV)[["id", "title"]].head(500)
    print(f"   {len(movies_df)} filme gasite in CSV.")
    print("\n>> Conectare la PostgreSQL...")
    conn   = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    print("   Conectat cu succes!")

    updated = 0
    failed  = 0

    print("\n>> Populare poster_url...")
    for _, row in movies_df.iterrows():
        tmdb_id = int(row["id"])
        titlu   = row["title"]
        url      = f"{TMDB_BASE_URL}/movie/{tmdb_id}"
        params   = {"api_key": TMDB_API_KEY}
        response = requests.get(url, params=params)

        if response.status_code == 200:
            data        = response.json()
            poster_path = data.get("poster_path")

            if poster_path:
                poster_url = f"{TMDB_IMAGE_BASE}{poster_path}"
                cursor.execute(
                    """
                    UPDATE FILME
                    SET poster_url = %s
                    WHERE titlu = %s
                    """,
                    (poster_url, titlu)
                )
                conn.commit()
                updated += 1
                print(f"   ✓ {titlu}")
            else:
                print(f"   - {titlu} (fara poster)")
                failed += 1
        else:
            print(f"   ✗ {titlu} (eroare API: {response.status_code})")
            failed += 1
        time.sleep(0.26)

    cursor.close()
    conn.close()

    print("\n" + "=" * 55)
    print(f"  GATA! Updated: {updated} | Fara poster: {failed}")
    print("=" * 55)

if __name__ == "__main__":
    main()