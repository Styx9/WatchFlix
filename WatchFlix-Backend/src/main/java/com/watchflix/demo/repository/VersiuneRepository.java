package com.watchflix.demo.repository;

import com.watchflix.demo.model.Versiune;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class VersiuneRepository {
    private final JdbcTemplate jdbcTemplate;

    public VersiuneRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Versiune> versiuneRowMapper = (rs, rowNum) -> {
        Versiune v = new Versiune();
        v.setId(rs.getInt("id"));
        v.setIdFilm(rs.getInt("id_film"));
        v.setRezolutie(rs.getString("rezolutie"));
        v.setLimba(rs.getString("limba"));
        v.setFormat(rs.getString("format"));
        String disponibila = rs.getString("disponibila");
        v.setDisponibila("Y".equalsIgnoreCase(disponibila) || "true".equalsIgnoreCase(disponibila));
        return v;
    };

    public List<Versiune> findByFilm(int idFilm) {
        String sql = "SELECT * FROM versiuni_film WHERE id_film = ?";
        return jdbcTemplate.query(sql, versiuneRowMapper, idFilm);
    }

    public Versiune save(Versiune versiune) {
        String sql = """
                INSERT INTO versiuni_film (id_film, rezolutie, limba, format, disponibila)
                VALUES (?, ?, ?, ?, ?) RETURNING id
                """;
        Integer id = jdbcTemplate.queryForObject(sql, Integer.class,
                versiune.getIdFilm(), versiune.getRezolutie(), versiune.getLimba(),
                versiune.getFormat(), versiune.isDisponibila() ? "Y" : "N");
        versiune.setId(id != null ? id : 0);
        return versiune;
    }
}
