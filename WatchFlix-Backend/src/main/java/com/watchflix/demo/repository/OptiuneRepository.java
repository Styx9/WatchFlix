package com.watchflix.demo.repository;

import com.watchflix.demo.model.ClientOptiune;
import com.watchflix.demo.model.OptiunePredefinita;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class OptiuneRepository {
    private final JdbcTemplate jdbcTemplate;

    public OptiuneRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<OptiunePredefinita> optiuneRowMapper = (rs, rowNum) -> {
        OptiunePredefinita optiune = new OptiunePredefinita();
        optiune.setId(rs.getInt("id"));
        optiune.setDenumire(rs.getString("denumire"));
        optiune.setTip(rs.getString("tip"));
        return optiune;
    };

    private final RowMapper<ClientOptiune> clientOptiuneRowMapper = (rs, rowNum) -> {
        ClientOptiune optiune = new ClientOptiune();
        optiune.setId(rs.getInt("id"));
        optiune.setIdClient(rs.getInt("id_client"));
        optiune.setIdFilm(rs.getInt("id_film"));
        optiune.setIdOptiune(rs.getInt("id_optiune"));
        optiune.setDenumire(rs.getString("denumire"));
        optiune.setTip(rs.getString("tip"));
        optiune.setData(rs.getDate("data").toLocalDate());
        return optiune;
    };

    public List<OptiunePredefinita> findAll() {
        String sql = """
                SELECT id, denumire, tip
                FROM optiuni_predefinite
                WHERE lower(denumire) IN (
                    'interesant',
                    'emotionant',
                    'plictisitor',
                    'actor principal apreciat',
                    'scenariu slab'
                )
                ORDER BY id
                """;
        return jdbcTemplate.query(sql, optiuneRowMapper);
    }

    public List<ClientOptiune> findByClientAndFilm(int idClient, int idFilm) {
        String sql = """
                SELECT co.id, co.id_client, co.id_film, co.id_optiune, op.denumire, op.tip, co.data
                FROM client_optiuni co
                JOIN optiuni_predefinite op ON op.id = co.id_optiune
                WHERE co.id_client = ? AND co.id_film = ?
                ORDER BY op.denumire
                """;
        return jdbcTemplate.query(sql, clientOptiuneRowMapper, idClient, idFilm);
    }

    public void replaceForClientAndFilm(int idClient, int idFilm, List<Integer> idOptiuni) {
        jdbcTemplate.update("DELETE FROM client_optiuni WHERE id_client = ? AND id_film = ?", idClient, idFilm);
        if (idOptiuni == null || idOptiuni.isEmpty()) {
            return;
        }

        String sql = """
                INSERT INTO client_optiuni (id_client, id_film, id_optiune, data)
                VALUES (?, ?, ?, CURRENT_DATE)
                ON CONFLICT (id_client, id_film, id_optiune) DO NOTHING
                """;
        for (Integer idOptiune : idOptiuni) {
            if (idOptiune != null) {
                jdbcTemplate.update(sql, idClient, idFilm, idOptiune);
            }
        }
    }
}
