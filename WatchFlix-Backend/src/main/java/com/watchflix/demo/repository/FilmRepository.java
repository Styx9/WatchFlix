package com.watchflix.demo.repository;

import com.watchflix.demo.model.Film;
import com.watchflix.demo.model.FilmPopular;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class FilmRepository {
    private final JdbcTemplate jdbcTemplate;

    public FilmRepository(JdbcTemplate jdbcTemplate){
        this.jdbcTemplate = jdbcTemplate;
    }
    private final RowMapper<Film> filmRowMapper = (rs,rowNum) ->{
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
    public int update(Film film)
    {
        String sql = """
                UPDATE filme
                SET titlu        = ?,
                    descriere    = ?,
                    id_categorie = ?,
                    data_lansare = ?,
                    poster_url   = ?
                WHERE id = ?
                """;
        return jdbcTemplate.update(
                sql,
                film.getTitlu(),
                film.getDescriere(),
                film.getIdCategorie(),
                film.getDataLansare(),
                film.getPosterUrl(),
                film.getId()
        );
    }
    public int delete(int id)
    {
        String sql = "DELETE FROM filme WHERE id = ?";
        return jdbcTemplate.update(sql,id);
    }
    private final RowMapper<FilmPopular> filmPopularRowMapper = (rs, rowNum) -> {
        FilmPopular fp = new FilmPopular();
        fp.setIdFilm(rs.getInt("id_film"));
        fp.setTitlu(rs.getString("titlu"));
        fp.setCategorie(rs.getString("categorie"));
        fp.setRating(rs.getDouble("rating"));
        fp.setNrVizualizari(rs.getInt("nr_vizualizari"));
        fp.setNrVoturi(rs.getInt("nr_voturi"));
        fp.setScorPopularitate(rs.getDouble("scor_popularitate"));
        return fp;
    };
    public List<Film> findAll(int page, int size){
        int offset = page * size;
        String sql = """
                SELECT f.id, f.titlu, f.descriere, f.id_categorie, c.nume AS categorie,
                       f.data_lansare, f.rating, f.poster_url
                FROM filme f
                LEFT JOIN categorii c ON c.id = f.id_categorie
                ORDER BY f.id
                LIMIT ? OFFSET ?""";
        try {
            return jdbcTemplate.query(sql,filmRowMapper,size,offset);
        } catch (BadSqlGrammarException ex) {
            String fallbackSql = """
                    SELECT f.id, f.titlu, f.descriere, f.id_categorie, c.nume AS categorie,
                           f.data_lansare, f.rating, NULL AS poster_url
                    FROM filme f
                    LEFT JOIN categorii c ON c.id = f.id_categorie
                    ORDER BY f.id
                    LIMIT ? OFFSET ?""";
            return jdbcTemplate.query(fallbackSql, filmRowMapper, size, offset);
        }
    }
    public int countAll(){
        String sql = "SELECT COUNT(*) FROM filme";
        Integer count = jdbcTemplate.queryForObject(sql,Integer.class);
        return count != null ? count : 0;
    }
    public Film findById(int id){
        String sql = """
                    SELECT f.id, f.titlu, f.descriere, f.id_categorie, c.nume AS categorie,
                           f.data_lansare, f.rating, f.poster_url
                    FROM filme f
                    LEFT JOIN categorii c ON c.id = f.id_categorie
                    WHERE f.id = ?
                """;
        List<Film> result;
        try {
            result = jdbcTemplate.query(sql,filmRowMapper,id);
        } catch (BadSqlGrammarException ex) {
            String fallbackSql = """
                    SELECT f.id, f.titlu, f.descriere, f.id_categorie, c.nume AS categorie,
                           f.data_lansare, f.rating, NULL AS poster_url
                    FROM filme f
                    LEFT JOIN categorii c ON c.id = f.id_categorie
                    WHERE f.id = ?
                    """;
            result = jdbcTemplate.query(fallbackSql, filmRowMapper, id);
        }
        return result.isEmpty() ? null : result.getFirst();
    }
    public List<Film> findByCategorie(int idCategorie, int page, int size){
        int offset = page * size;
        String sql = """
                SELECT f.id, f.titlu, f.descriere, f.id_categorie, c.nume AS categorie,
                       f.data_lansare, f.rating, f.poster_url
                FROM filme f
                LEFT JOIN categorii c ON c.id = f.id_categorie
                WHERE f.id_categorie = ?
                ORDER BY rating DESC
                LIMIT ? OFFSET ?
                """;
        try {
            return jdbcTemplate.query(sql, filmRowMapper, idCategorie, size, offset);
        } catch (BadSqlGrammarException ex) {
            String fallbackSql = """
                    SELECT f.id, f.titlu, f.descriere, f.id_categorie, c.nume AS categorie,
                           f.data_lansare, f.rating, NULL AS poster_url
                    FROM filme f
                    LEFT JOIN categorii c ON c.id = f.id_categorie
                    WHERE f.id_categorie = ?
                    ORDER BY f.rating DESC
                    LIMIT ? OFFSET ?
                    """;
            return jdbcTemplate.query(fallbackSql, filmRowMapper, idCategorie, size, offset);
        }
    }
    public List<Film> findByTitlu(String titlu){
        String sql = """
                SELECT f.id, f.titlu, f.descriere, f.id_categorie, c.nume AS categorie,
                       f.data_lansare, f.rating, f.poster_url
                FROM filme f
                LEFT JOIN categorii c ON c.id = f.id_categorie
                WHERE LOWER(f.titlu) LIKE LOWER(?)
                ORDER BY f.rating DESC
                LIMIT 20
                """;
        try {
            return jdbcTemplate.query(sql, filmRowMapper, "%" + titlu + "%");
        } catch (BadSqlGrammarException ex) {
            String fallbackSql = """
                    SELECT f.id, f.titlu, f.descriere, f.id_categorie, c.nume AS categorie,
                           f.data_lansare, f.rating, NULL AS poster_url
                    FROM filme f
                    LEFT JOIN categorii c ON c.id = f.id_categorie
                    WHERE LOWER(f.titlu) LIKE LOWER(?)
                    ORDER BY f.rating DESC
                    LIMIT 20
                    """;
            return jdbcTemplate.query(fallbackSql, filmRowMapper, "%" + titlu + "%");
        }
    }
    public List<FilmPopular> getFilmePopulare(int limit) {
        String sql = "SELECT * FROM get_filme_populare(?)";
        return jdbcTemplate.query(sql, filmPopularRowMapper, limit);
    }
    public Film save(Film film) {
        String sql = """
                INSERT INTO filme (titlu, descriere, id_categorie, data_lansare, rating, poster_url)
                VALUES (?, ?, ?, ?, ?, ?)
                RETURNING id
                """;
        Integer nouId = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                film.getTitlu(),
                film.getDescriere(),
                film.getIdCategorie(),
                film.getDataLansare(),
                film.getRating(),
                film.getPosterUrl()
        );
        film.setId(nouId != null ? nouId : 0);
        return film;
    }

}
