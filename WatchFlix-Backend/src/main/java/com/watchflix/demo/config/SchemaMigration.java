package com.watchflix.demo.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class SchemaMigration implements CommandLineRunner {
    private final JdbcTemplate jdbcTemplate;

    public SchemaMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        jdbcTemplate.execute("ALTER TABLE filme ADD COLUMN IF NOT EXISTS poster_url VARCHAR(500)");
        jdbcTemplate.execute("ALTER TABLE actori ADD COLUMN IF NOT EXISTS poza VARCHAR(500)");
        jdbcTemplate.execute("ALTER TABLE clienti ADD COLUMN IF NOT EXISTS username VARCHAR(100)");
        jdbcTemplate.execute("ALTER TABLE clienti ADD COLUMN IF NOT EXISTS parola VARCHAR(200)");
        jdbcTemplate.execute("""
                UPDATE clienti
                SET username = COALESCE(username, lower(prenume || '.' || nume || id)),
                    parola = COALESCE(parola, '$2a$10$7QDwTXUjeJx63WWaE3wqE.XPxsFPco58Fgh0rNvvd83Uk1X5grvY.')
                """);
        jdbcTemplate.execute("CREATE UNIQUE INDEX IF NOT EXISTS uq_clienti_username ON clienti(username)");
        jdbcTemplate.execute("""
                INSERT INTO optiuni_predefinite (denumire, tip) VALUES
                    ('interesant', 'POZITIV'),
                    ('emotionant', 'POZITIV'),
                    ('plictisitor', 'NEGATIV'),
                    ('actor principal apreciat', 'POZITIV'),
                    ('scenariu slab', 'NEGATIV')
                ON CONFLICT (denumire) DO NOTHING
                """);
    }
}
