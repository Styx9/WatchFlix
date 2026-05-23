
#Script: Populare poza actori din TMDB API + adaugare coloana poza in actori


import psycopg2
import requests
import time


DB_CONFIG = {
    "host":     "localhost",
    "port":     5432,
    "database": "filme_db",
    "user":     "postgres",
    "password": "password"
}

TMDB_API_KEY    = "0720869574603b8ccba8c2a24fd80ec8"
TMDB_BASE_URL   = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w185"

def main():
    print("=" * 55)
    print("  POPULARE POZE ACTORI - PLATFORMA FILME")
    print("=" * 55)

    print("\n>> Conectare la PostgreSQL...")
    conn   = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    print("   Conectat cu succes!")

    print("\n>> Adaugare coloana poza in tabela actori (daca nu exista)...")
    cursor.execute("""
                   ALTER TABLE actori ADD COLUMN IF NOT EXISTS poza VARCHAR(500);
                   """)
    conn.commit()
    print("   Coloana poza OK.")

    cursor.execute("SELECT id, prenume, nume_familie FROM actori ORDER BY id")
    actori = cursor.fetchall()
    print(f"\n>> {len(actori)} actori gasiti in baza de date.")
    print(">> Populare poze...\n")

    updated = 0
    failed  = 0

    for actor_id, prenume, nume_familie in actori:
        nume_complet = f"{prenume} {nume_familie}"

        url    = f"{TMDB_BASE_URL}/search/person"
        params = {
            "api_key": TMDB_API_KEY,
            "query":   nume_complet,
            "page":    1
        }
        response = requests.get(url, params=params)

        if response.status_code == 200:
            data    = response.json()
            results = data.get("results", [])

            if results:
                profile_path = results[0].get("profile_path")

                if profile_path:
                    poza_url = f"{TMDB_IMAGE_BASE}{profile_path}"
                    cursor.execute(
                        "UPDATE actori SET poza = %s WHERE id = %s",
                        (poza_url, actor_id)
                    )
                    conn.commit()
                    updated += 1
                    print(f"   ✓ {nume_complet}")
                else:
                    print(f"   - {nume_complet} (fara poza)")
                    failed += 1
            else:
                print(f"   ? {nume_complet} (negasit pe TMDB)")
                failed += 1
        else:
            print(f"   ✗ {nume_complet} (eroare API: {response.status_code})")
            failed += 1

        time.sleep(0.26)

    cursor.close()
    conn.close()

    print("\n" + "=" * 55)
    print(f"  GATA! Actualizati: {updated} | Fara poza: {failed}")
    print("=" * 55)


if __name__ == "__main__":
    main()