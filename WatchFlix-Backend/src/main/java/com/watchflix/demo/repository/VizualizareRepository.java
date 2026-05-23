package com.watchflix.demo.repository;

import com.watchflix.demo.model.Vizualizare;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class VizualizareRepository {
    private final JdbcTemplate jdbcTemplate;

    public VizualizareRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Vizualizare> vizualizareRowMapper = (rs, rowNum) -> {
        Vizualizare vizualizare = new Vizualizare();
        vizualizare.setId(rs.getInt("id"));
        vizualizare.setIdClient(rs.getInt("id_client"));
        vizualizare.setIdFilm(rs.getInt("id_film"));
        vizualizare.setIdVersiune(rs.getInt("id_versiune"));
        vizualizare.setDataVizualizare(rs.getDate("data_vizualizare").toLocalDate());
        vizualizare.setDurataVizualizata(rs.getObject("durata_vizualizata") != null
                ? rs.getInt("durata_vizualizata") : null);
        vizualizare.setStare(rs.getString("stare"));
        return vizualizare;
    };

    public Vizualizare save(Vizualizare vizualizare) {
        int idVersiune = resolveVersiune(vizualizare.getIdFilm(), vizualizare.getIdVersiune());
        String sql = """
                INSERT INTO vizualizari (id_client, id_film, id_versiune, data_vizualizare, durata_vizualizata, stare)
                VALUES (?, ?, ?, COALESCE(?, CURRENT_DATE), ?, COALESCE(?, 'INCOMPLETA'))
                RETURNING id, id_client, id_film, id_versiune, data_vizualizare, durata_vizualizata, stare
                """;
        return jdbcTemplate.queryForObject(
                sql,
                vizualizareRowMapper,
                vizualizare.getIdClient(),
                vizualizare.getIdFilm(),
                idVersiune,
                vizualizare.getDataVizualizare(),
                vizualizare.getDurataVizualizata(),
                vizualizare.getStare()
        );
    }

    private int resolveVersiune(int idFilm, int requestedIdVersiune) {
        if (requestedIdVersiune > 0) {
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM versiuni_film WHERE id = ? AND id_film = ?",
                    Integer.class,
                    requestedIdVersiune,
                    idFilm
            );
            if (count != null && count > 0) {
                return requestedIdVersiune;
            }
        }

        java.util.List<Integer> existing = jdbcTemplate.query(
                "SELECT id FROM versiuni_film WHERE id_film = ? ORDER BY id LIMIT 1",
                (rs, rowNum) -> rs.getInt("id"),
                idFilm
        );
        if (!existing.isEmpty()) {
            return existing.getFirst();
        }

        Integer id = jdbcTemplate.queryForObject(
                """
                INSERT INTO versiuni_film (id_film, rezolutie, limba, format, disponibila)
                VALUES (?, 'HD', 'Original', 'MP4', 'Y')
                RETURNING id
                """,
                Integer.class,
                idFilm
        );
        return id != null ? id : 0;
    }
}
