package com.watchflix.demo.repository;

import com.watchflix.demo.model.Actor;
import com.watchflix.demo.model.Film;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ActorRepository {

    private final JdbcTemplate jdbcTemplate;

    public ActorRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
    private final RowMapper<Actor> actorRowMapper = (rs, rowNum) -> {
        Actor actor = new Actor();
        actor.setId(rs.getInt("id"));
        actor.setNumeScena(rs.getString("nume_scena"));
        actor.setPrenume(rs.getString("prenume"));
        actor.setNumeFamilie(rs.getString("nume_familie"));
        actor.setDataNastere(rs.getDate("data_nastere") != null
                ? rs.getDate("data_nastere").toLocalDate() : null);
        actor.setPoza(rs.getString("poza"));
        return actor;
    };
    private final RowMapper<Film> filmRowMapper = (rs, rowNum) -> {
        Film film = new Film();
        film.setId(rs.getInt("id"));
        film.setTitlu(rs.getString("titlu"));
        film.setDescriere(rs.getString("descriere"));
        film.setIdCategorie(rs.getInt("id_categorie"));
        try {
            film.setCategorie(rs.getString("categorie"));
        } catch (java.sql.SQLException ignored) {
            film.setCategorie(null);
        }
        film.setDataLansare(rs.getDate("data_lansare") != null
                ? rs.getDate("data_lansare").toLocalDate() : null);
        film.setRating(rs.getDouble("rating"));
        film.setPosterUrl(rs.getString("poster_url"));
        return film;
    };
    public List<Actor> findAll() {
        String sql = """
                SELECT id, nume_scena, prenume, nume_familie, data_nastere, poza
                FROM actori
                ORDER BY nume_familie, prenume
                """;
        return jdbcTemplate.query(sql, actorRowMapper);
    }
    public Actor findById(int id) {
        String sql = """
                SELECT id, nume_scena, prenume, nume_familie, data_nastere, poza
                FROM actori
                WHERE id = ?
                """;
        List<Actor> rezultat = jdbcTemplate.query(sql, actorRowMapper, id);
        return rezultat.isEmpty() ? null : rezultat.get(0);
    }
    public List<Actor> findByFilm(int idFilm) {
        String sql = """
                SELECT a.id, a.nume_scena, a.prenume, a.nume_familie, a.data_nastere, a.poza,
                       r.tip_rol
                FROM actori a
                JOIN roluri r ON r.id_actor = a.id
                WHERE r.id_film = ?
                ORDER BY r.tip_rol DESC
                """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Actor actor = actorRowMapper.mapRow(rs, rowNum);
            return actor;
        }, idFilm);
    }
    public List<Film> findFilmeByActor(int idActor) {
        String sql = """
                SELECT f.id, f.titlu, f.descriere, f.id_categorie, c.nume AS categorie,
                       f.data_lansare, f.rating, f.poster_url
                FROM filme f
                JOIN roluri r ON r.id_film = f.id
                LEFT JOIN categorii c ON c.id = f.id_categorie
                WHERE r.id_actor = ?
                ORDER BY f.rating DESC, f.titlu
                """;
        return jdbcTemplate.query(sql, filmRowMapper, idActor);
    }
    public Actor save(Actor actor) {
        String sql = """
                INSERT INTO actori (nume_scena, prenume, nume_familie, data_nastere, poza)
                VALUES (?, ?, ?, ?, ?)
                RETURNING id
                """;
        Integer nouId = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                actor.getNumeScena(),
                actor.getPrenume(),
                actor.getNumeFamilie(),
                actor.getDataNastere(),
                actor.getPoza()
        );
        actor.setId(nouId != null ? nouId : 0);
        return actor;
    }
}
