package com.watchflix.demo.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class StatisticiRepository {
    private final JdbcTemplate jdbcTemplate;

    public StatisticiRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Map<String, Object>> getSentimentFilm(int idFilm) {
        return jdbcTemplate.queryForList("SELECT * FROM get_sentiment_film(?)", idFilm);
    }

    public List<Map<String, Object>> getSentimentCategorie(int idCategorie) {
        return jdbcTemplate.queryForList("SELECT * FROM get_sentiment_categorie(?)", idCategorie);
    }

    public List<Map<String, Object>> getSentimentActor(int idActor) {
        return jdbcTemplate.queryForList("SELECT * FROM get_sentiment_actor(?)", idActor);
    }

    public List<Map<String, Object>> getGrupareClienti() {
        return jdbcTemplate.queryForList("SELECT * FROM get_grupare_clienti()");
    }

    public List<Map<String, Object>> getPredictiiSezoniere(int lunaStart, int lunaEnd, int limit) {
        try {
            List<Map<String, Object>> rezultat = jdbcTemplate.queryForList(
                    "SELECT * FROM get_predictii_sezoniere(?, ?, ?)",
                    lunaStart,
                    lunaEnd,
                    limit
            );
            if (!rezultat.isEmpty()) {
                return rezultat;
            }
        } catch (DataAccessException ignored) {
            // Daca functia nu a fost reinstalata inca, folosim aceeasi logica sub forma de query SQL.
        }

        String sql = """
                WITH viz_perioada AS (
                    SELECT id_film, COUNT(*) AS nr_vizualizari
                    FROM vizualizari
                    WHERE EXTRACT(MONTH FROM data_vizualizare) BETWEEN ? AND ?
                    GROUP BY id_film
                ),
                popularitate_categorii AS (
                    SELECT f.id_categorie, COUNT(*) AS nr_vizualizari_categorie
                    FROM vizualizari v
                    JOIN filme f ON f.id = v.id_film
                    WHERE EXTRACT(MONTH FROM v.data_vizualizare) BETWEEN ? AND ?
                    GROUP BY f.id_categorie
                ),
                popularitate_actori AS (
                    SELECT r.id_actor, COUNT(*) AS nr_vizualizari_actor
                    FROM vizualizari v
                    JOIN roluri r ON r.id_film = v.id_film
                    WHERE EXTRACT(MONTH FROM v.data_vizualizare) BETWEEN ? AND ?
                    GROUP BY r.id_actor
                ),
                reactii_filme AS (
                    SELECT
                        f.id AS id_film,
                        COALESCE(AVG(vot.valoare), f.rating, 0) AS rating_reactii,
                        SUM(CASE
                            WHEN com.sentiment = 'POZITIV' THEN 1
                            WHEN com.sentiment = 'NEGATIV' THEN -1
                            ELSE 0
                        END) AS scor_sentiment,
                        SUM(CASE
                            WHEN op.tip = 'POZITIV' THEN 1
                            WHEN op.tip = 'NEGATIV' THEN -1
                            ELSE 0
                        END) AS scor_optiuni
                    FROM filme f
                    LEFT JOIN voturi vot ON vot.id_film = f.id
                    LEFT JOIN comentarii com ON com.id_film = f.id
                    LEFT JOIN client_optiuni co ON co.id_film = f.id
                    LEFT JOIN optiuni_predefinite op ON op.id = co.id_optiune
                    GROUP BY f.id, f.rating
                )
                SELECT
                    f.id AS id_film,
                    f.titlu AS titlu,
                    c.nume AS categorie,
                    COALESCE(vp.nr_vizualizari, 0) AS vizualizari_istorice,
                    ROUND(COALESCE(rf.rating_reactii, f.rating, 0)::numeric, 2) AS rating,
                    ROUND((
                        COALESCE(vp.nr_vizualizari, 0) * 4.0
                        + COALESCE(pc.nr_vizualizari_categorie, 0) * 0.8
                        + COALESCE(SUM(pa.nr_vizualizari_actor), 0) * 0.35
                        + COALESCE(rf.rating_reactii, f.rating, 0) * 5.0
                        + COALESCE(rf.scor_sentiment, 0) * 1.5
                        + COALESCE(rf.scor_optiuni, 0) * 1.0
                    )::numeric, 2) AS scor_predictie
                FROM filme f
                JOIN categorii c ON c.id = f.id_categorie
                LEFT JOIN viz_perioada vp ON vp.id_film = f.id
                LEFT JOIN popularitate_categorii pc ON pc.id_categorie = f.id_categorie
                LEFT JOIN roluri r ON r.id_film = f.id
                LEFT JOIN popularitate_actori pa ON pa.id_actor = r.id_actor
                LEFT JOIN reactii_filme rf ON rf.id_film = f.id
                GROUP BY f.id, f.titlu, c.nume, f.rating, vp.nr_vizualizari,
                         pc.nr_vizualizari_categorie, rf.rating_reactii,
                         rf.scor_sentiment, rf.scor_optiuni
                ORDER BY scor_predictie DESC, f.rating DESC
                LIMIT ?
                """;
        return jdbcTemplate.queryForList(sql, lunaStart, lunaEnd, lunaStart, lunaEnd, lunaStart, lunaEnd, limit);
    }
}
