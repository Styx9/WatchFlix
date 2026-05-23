package com.watchflix.demo.repository;

import com.watchflix.demo.model.Recomandare;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class RecomandariRepository {
    private final JdbcTemplate jdbcTemplate;

    public RecomandariRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Recomandare> recomandareRowMapper = (rs, rowNum) -> {
        Recomandare r = new Recomandare();
        r.setId(rs.getInt("id"));
        r.setIdClient(rs.getInt("id_client"));
        r.setIdFilm(rs.getInt("id_film"));
        r.setScorCompatibilitate(rs.getInt("scor_compatibilitate"));
        r.setMotiv(rs.getString("motiv"));
        r.setDataGenerare(rs.getTimestamp("data_generare"));
        String vizualizata = rs.getString("vizualizata");
        r.setVizualizata("Y".equalsIgnoreCase(vizualizata) || "true".equalsIgnoreCase(vizualizata));
        return r;
    };

    public void genereazaRecomandari(int idClient) {
        jdbcTemplate.update("CALL genereaza_recomandari(?)", idClient);
    }

    public List<Recomandare> findByClient(int idClient) {
        String sql = "SELECT * FROM recomandari WHERE id_client = ? ORDER BY scor_compatibilitate DESC";
        return jdbcTemplate.query(sql, recomandareRowMapper, idClient);
    }

    public int markVizualizata(int idClient, int idFilm) {
        // Presupunând că tabelul recomandări are id_film sau se identifică prin id-ul recomandării
        String sql = "UPDATE recomandari SET vizualizata = 'Y' WHERE id_client = ? AND id_film = ?";
        return jdbcTemplate.update(sql, idClient, idFilm);
    }
}
