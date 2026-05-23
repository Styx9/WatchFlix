package com.watchflix.demo.repository;

import com.watchflix.demo.model.Client;
import com.watchflix.demo.model.IstoricClient;
import com.watchflix.demo.model.ProfilClient;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ClientRepository {
    private final JdbcTemplate jdbcTemplate;

    public ClientRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Client> clientRowMapper = (rs, rowNum) -> {
        Client client = new Client();
        client.setId(rs.getInt("id"));
        client.setNume(rs.getString("nume"));
        client.setPrenume(rs.getString("prenume"));
        client.setTelefon(rs.getString("telefon"));
        client.setAdresa(rs.getString("adresa"));
        client.setOras(rs.getString("oras"));
        client.setEmail(rs.getString("email"));
        client.setTelefonMobil(rs.getString("telefon_mobil"));
        client.setUsername(rs.getString("username"));
        client.setParola(rs.getString("parola"));
        return client;
    };
    private final RowMapper<ProfilClient> profilRowMapper = (rs, rowNum) -> {
        ProfilClient profil = new ProfilClient();
        profil.setCategoriePreferata(rs.getString("categorie_preferata"));
        profil.setActorPreferat(rs.getString("actor_preferat"));
        profil.setTotalFilmeVazute(rs.getInt("total_filme_vazute"));
        profil.setTotalFilmeVotate(rs.getInt("total_filme_votate"));
        profil.setRatingMediuAcordat(rs.getDouble("rating_mediu_acordat"));
        profil.setSentimentDominant(rs.getString("sentiment_dominant"));
        return profil;
    };

    private final RowMapper<IstoricClient> istoricRowMapper = (rs, rowNum) -> {
        IstoricClient istoric = new IstoricClient();
        istoric.setIdVizualizare(rs.getObject("id_vizualizare") != null
                ? rs.getInt("id_vizualizare") : null);
        istoric.setIdFilm(rs.getInt("id_film"));
        istoric.setTitlu(rs.getString("titlu_film"));
        istoric.setCategorie(rs.getString("categorie"));
        istoric.setDataVizualizare(rs.getDate("data_vizualizare") != null
                ? rs.getDate("data_vizualizare").toLocalDate() : null);
        istoric.setVersiune(rs.getString("versiune"));
        istoric.setStare(rs.getString("stare"));
        istoric.setVotAcordat(rs.getObject("vot_acordat") != null
                ? rs.getDouble("vot_acordat") : null);
        istoric.setComentariu(rs.getString("comentariu"));
        istoric.setSentiment(rs.getString("sentiment"));
        return istoric;
    };
    public List<Client> findAll() {
        String sql = "SELECT * FROM clienti ORDER BY id";
        return jdbcTemplate.query(sql, clientRowMapper);
    }
    public Client findByUsername(String username) {
        String sql = """
            SELECT id, nume, prenume, telefon, adresa, oras, email, telefon_mobil, username, parola
            FROM clienti
            WHERE username = ?
            """;
        List<Client> rezultat = jdbcTemplate.query(sql, clientRowMapper, username);
        return rezultat.isEmpty() ? null : rezultat.get(0);
    }
    public Client findById(int id) {
        String sql = "SELECT * FROM clienti WHERE id = ?";
        List<Client> results = jdbcTemplate.query(sql, clientRowMapper, id);
        return results.isEmpty() ? null : results.getFirst();
    }

    public Client save(Client client) {
        String sql = """
                INSERT INTO clienti (username, parola, nume, prenume, telefon, adresa, oras, email, telefon_mobil)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id
                """;
        Integer id = jdbcTemplate.queryForObject(sql, Integer.class,
                client.getUsername(),
                client.getParola(),
                client.getNume(), client.getPrenume(), client.getTelefon(),
                client.getAdresa(), client.getOras(), client.getEmail(), client.getTelefonMobil());
        client.setId(id != null ? id : 0);
        return client;
    }

    public int update(Client client) {
        String sql = """
                UPDATE clienti SET nume=?, prenume=?, telefon=?, adresa=?, oras=?, email=?, telefon_mobil=?
                WHERE id = ?
                """;
        return jdbcTemplate.update(sql, client.getNume(), client.getPrenume(),
                client.getTelefon(), client.getAdresa(), client.getOras(),
                client.getEmail(), client.getTelefonMobil(), client.getId());
    }

    public int delete(int id) {
        String sql = "DELETE FROM clienti WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }

    public ProfilClient getProfilClient(int idClient) {
        String sql = """
                SELECT
                    (
                        SELECT c.nume
                        FROM vizualizari viz
                        JOIN filme f ON f.id = viz.id_film
                        JOIN categorii c ON c.id = f.id_categorie
                        WHERE viz.id_client = ?
                        GROUP BY c.nume
                        ORDER BY COUNT(*) DESC
                        LIMIT 1
                    ) AS categorie_preferata,
                    (
                        SELECT COALESCE(a.nume_scena, a.prenume || ' ' || a.nume_familie)
                        FROM vizualizari viz
                        JOIN roluri r ON r.id_film = viz.id_film
                        JOIN actori a ON a.id = r.id_actor
                        WHERE viz.id_client = ?
                        GROUP BY a.id, a.nume_scena, a.prenume, a.nume_familie
                        ORDER BY COUNT(*) DESC
                        LIMIT 1
                    ) AS actor_preferat,
                    (
                        SELECT COUNT(DISTINCT id_film)
                        FROM vizualizari
                        WHERE id_client = ?
                    ) AS total_filme_vazute,
                    (
                        SELECT COUNT(*)
                        FROM voturi
                        WHERE id_client = ?
                    ) AS total_filme_votate,
                    (
                        SELECT ROUND(AVG(valoare)::numeric, 2)
                        FROM voturi
                        WHERE id_client = ?
                    ) AS rating_mediu_acordat,
                    (
                        SELECT sentiment
                        FROM comentarii
                        WHERE id_client = ?
                        GROUP BY sentiment
                        ORDER BY COUNT(*) DESC
                        LIMIT 1
                    ) AS sentiment_dominant
                """;
        List<ProfilClient> rezultat = jdbcTemplate.query(sql, profilRowMapper,
                idClient, idClient, idClient, idClient, idClient, idClient);
        return rezultat.isEmpty() ? null : rezultat.getFirst();
    }

    public List<IstoricClient> getIstoricClient(int idClient) {
        String sql = """
                SELECT
                    viz.id AS id_vizualizare,
                    f.id AS id_film,
                    f.titlu AS titlu_film,
                    c.nume AS categorie,
                    viz.data_vizualizare,
                    (vf.rezolutie || ' - ' || vf.limba) AS versiune,
                    viz.stare,
                    vot.valoare AS vot_acordat,
                    com.text_comentariu AS comentariu,
                    com.sentiment
                FROM vizualizari viz
                JOIN filme f ON f.id = viz.id_film
                JOIN categorii c ON c.id = f.id_categorie
                JOIN versiuni_film vf ON vf.id = viz.id_versiune
                LEFT JOIN voturi vot ON vot.id_film = viz.id_film AND vot.id_client = viz.id_client
                LEFT JOIN LATERAL (
                    SELECT text_comentariu, sentiment
                    FROM comentarii
                    WHERE id_film = viz.id_film AND id_client = viz.id_client
                    ORDER BY data_comentariu DESC, id DESC
                    LIMIT 1
                ) com ON TRUE
                WHERE viz.id_client = ?
                ORDER BY viz.data_vizualizare DESC, viz.id DESC
                """;
        return jdbcTemplate.query(sql, istoricRowMapper, idClient);
    }
    public Client findByEmail(String email) {
        String sql = """
            SELECT id, nume, prenume, telefon, adresa, oras, email, telefon_mobil, username, parola
            FROM clienti
            WHERE email = ?
            """;
        List<Client> rezultat = jdbcTemplate.query(sql, clientRowMapper, email);
        return rezultat.isEmpty() ? null : rezultat.getFirst();
    }
}
