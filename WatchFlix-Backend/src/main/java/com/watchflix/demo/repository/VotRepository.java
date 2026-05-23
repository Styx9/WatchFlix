package com.watchflix.demo.repository;

import com.watchflix.demo.model.Vot;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class VotRepository {
    private final JdbcTemplate jdbcTemplate;

    public VotRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Vot> votRowMapper = (rs, rowNum) -> {
        Vot vot = new Vot();
        vot.setId(rs.getInt("id"));
        vot.setIdClient(rs.getInt("id_client"));
        vot.setIdFilm(rs.getInt("id_film"));
        vot.setValoare(rs.getInt("valoare"));
        vot.setDataVot(rs.getDate("data_vot").toLocalDate());
        return vot;
    };

    public void addVot(int idClient, int idFilm, int valoare) {
        String sql = """
                INSERT INTO voturi (id_client, id_film, valoare, data_vot)
                VALUES (?, ?, ?, CURRENT_DATE)
                ON CONFLICT (id_client, id_film)
                DO UPDATE SET valoare = EXCLUDED.valoare, data_vot = CURRENT_DATE
                """;
        jdbcTemplate.update(sql, idClient, idFilm, valoare);
        jdbcTemplate.update("""
                UPDATE filme
                SET rating = COALESCE((SELECT ROUND(AVG(valoare)::numeric, 2) FROM voturi WHERE id_film = ?), 0)
                WHERE id = ?
                """, idFilm, idFilm);
    }

    public Vot getVotClient(int idClient, int idFilm) {
        String sql = "SELECT * FROM voturi WHERE id_client = ? AND id_film = ?";
        List<Vot> results = jdbcTemplate.query(sql, votRowMapper, idClient, idFilm);
        return results.isEmpty() ? null : results.getFirst();
    }

    public int deleteVot(int idClient, int idFilm) {
        String sql = "DELETE FROM voturi WHERE id_client = ? AND id_film = ?";
        return jdbcTemplate.update(sql, idClient, idFilm);
    }
    public List<Vot> getVoturiByFilm(int idFilm)
    {
        String sql = "SELECT * FROM VOTURI WHERE id_film = ?";
        List<Vot> results = jdbcTemplate.query(sql,votRowMapper,idFilm);
        return results;
    }
}
