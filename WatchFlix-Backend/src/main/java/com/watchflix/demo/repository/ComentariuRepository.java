package com.watchflix.demo.repository;

import com.watchflix.demo.model.Comentariu;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ComentariuRepository {
    private final JdbcTemplate jdbcTemplate;

    public ComentariuRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Comentariu> comentariuRowMapper = (rs, rowNum) -> {
        Comentariu c = new Comentariu();
        c.setId(rs.getInt("id"));
        c.setIdClient(rs.getInt("id_client"));
        c.setIdFilm(rs.getInt("id_film"));
        c.setTextComentariu(rs.getString("text_comentariu"));
        c.setDataComentariu(rs.getDate("data_comentariu").toLocalDate());
        c.setSentiment(rs.getString("sentiment"));
        try {
            c.setUsername(rs.getString("username"));
            c.setNumeClient(rs.getString("nume_client"));
        } catch (java.sql.SQLException ignored) {
            c.setUsername(null);
            c.setNumeClient(null);
        }
        return c;
    };

    public List<Comentariu> findByFilm(int idFilm) {
        String sql = """
                SELECT co.id, co.id_client, co.id_film, co.text_comentariu, co.data_comentariu, co.sentiment,
                       cl.username,
                       NULLIF(TRIM(COALESCE(cl.prenume, '') || ' ' || COALESCE(cl.nume, '')), '') AS nume_client
                FROM comentarii co
                JOIN clienti cl ON cl.id = co.id_client
                WHERE co.id_film = ?
                ORDER BY co.data_comentariu DESC, co.id DESC
                """;
        return jdbcTemplate.query(sql, comentariuRowMapper, idFilm);
    }

    public List<Comentariu> findByClient(int idClient) {
        String sql = """
                SELECT co.id, co.id_client, co.id_film, co.text_comentariu, co.data_comentariu, co.sentiment,
                       cl.username,
                       NULLIF(TRIM(COALESCE(cl.prenume, '') || ' ' || COALESCE(cl.nume, '')), '') AS nume_client
                FROM comentarii co
                JOIN clienti cl ON cl.id = co.id_client
                WHERE co.id_client = ?
                ORDER BY co.data_comentariu DESC, co.id DESC
                """;
        return jdbcTemplate.query(sql, comentariuRowMapper, idClient);
    }

    public Comentariu save(Comentariu comentariu) {
        String sql = """
                WITH inserted AS (
                    INSERT INTO comentarii (id_client, id_film, text_comentariu)
                    VALUES (?, ?, ?)
                    RETURNING id, id_client, id_film, text_comentariu, data_comentariu, sentiment
                )
                SELECT i.id, i.id_client, i.id_film, i.text_comentariu, i.data_comentariu, i.sentiment,
                       cl.username,
                       NULLIF(TRIM(COALESCE(cl.prenume, '') || ' ' || COALESCE(cl.nume, '')), '') AS nume_client
                FROM inserted i
                JOIN clienti cl ON cl.id = i.id_client
                """;
        Comentariu saved = jdbcTemplate.queryForObject(sql, comentariuRowMapper,
                comentariu.getIdClient(), comentariu.getIdFilm(), comentariu.getTextComentariu());
        return saved != null ? saved : comentariu;
    }

    public int delete(int id) {
        String sql = "DELETE FROM comentarii WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }
}
