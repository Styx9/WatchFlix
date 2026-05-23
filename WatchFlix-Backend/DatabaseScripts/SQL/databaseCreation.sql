DROP TABLE IF EXISTS RECOMANDARI CASCADE;
DROP TABLE IF EXISTS CLIENT_OPTIUNI CASCADE;
DROP TABLE IF EXISTS OPTIUNI_PREDEFINITE CASCADE;
DROP TABLE IF EXISTS COMENTARII CASCADE;
DROP TABLE IF EXISTS VOTURI CASCADE;
DROP TABLE IF EXISTS VIZUALIZARI CASCADE;
DROP TABLE IF EXISTS ROLURI CASCADE;
DROP TABLE IF EXISTS ACTORI CASCADE;
DROP TABLE IF EXISTS VERSIUNI_FILM CASCADE;
DROP TABLE IF EXISTS FILME CASCADE;
DROP TABLE IF EXISTS CLIENTI CASCADE;
DROP TABLE IF EXISTS CATEGORII CASCADE;
CREATE TABLE CATEGORII (
                           id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                           nume        VARCHAR(100) NOT NULL UNIQUE,
                           descriere   VARCHAR(500)
);
CREATE TABLE FILME (
                       id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                       titlu           VARCHAR(200) NOT NULL,
                       descriere       VARCHAR(2000),
                       id_categorie    INTEGER NOT NULL,
                       data_lansare    DATE,
                       rating          DECIMAL(4,2) DEFAULT 0,
                       poster_url      VARCHAR(500),

                       CONSTRAINT fk_film_categorie FOREIGN KEY (id_categorie) REFERENCES CATEGORII(id),
                       CONSTRAINT chk_rating CHECK (rating >= 0 AND rating <= 10)
);
CREATE TABLE VERSIUNI_FILM (
                               id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                               id_film     INTEGER NOT NULL,
                               rezolutie   VARCHAR(10) NOT NULL,
                               limba       VARCHAR(50) NOT NULL,
                               format      VARCHAR(50),
                               disponibila CHAR(1) DEFAULT 'Y',

                               CONSTRAINT fk_versiune_film FOREIGN KEY (id_film) REFERENCES FILME(id) ON DELETE CASCADE,
                               CONSTRAINT chk_rezolutie CHECK (rezolutie IN ('SD', 'HD', '4K')),
                               CONSTRAINT chk_disponibila CHECK (disponibila IN ('Y', 'N'))
);
CREATE TABLE ACTORI (
                        id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                        nume_scena      VARCHAR(100),
                        prenume         VARCHAR(100) NOT NULL,
                        nume_familie    VARCHAR(100) NOT NULL,
                        data_nastere    DATE,
                        poza            VARCHAR(500)
);
CREATE TABLE ROLURI (
                        id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                        id_film         INTEGER NOT NULL,
                        id_actor        INTEGER NOT NULL,
                        tip_rol         VARCHAR(50),
                        comentariu_rol  VARCHAR(500),

                        CONSTRAINT fk_rol_film FOREIGN KEY (id_film) REFERENCES FILME(id) ON DELETE CASCADE,
                        CONSTRAINT fk_rol_actor FOREIGN KEY (id_actor) REFERENCES ACTORI(id) ON DELETE CASCADE,
                        CONSTRAINT uq_rol UNIQUE (id_film, id_actor),
                        CONSTRAINT chk_tip_rol CHECK (tip_rol IN ('Principal', 'Secundar', 'Figuratie'))
);
CREATE TABLE CLIENTI (
                         id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                         username        VARCHAR(100) NOT NULL UNIQUE,
                         parola          VARCHAR(200) NOT NULL,
                         nume            VARCHAR(100) NOT NULL,
                         prenume         VARCHAR(100) NOT NULL,
                         telefon         VARCHAR(20),
                         adresa          VARCHAR(200),
                         oras            VARCHAR(100),
                         email           VARCHAR(150) UNIQUE,
                         telefon_mobil   VARCHAR(20)
);
CREATE TABLE VIZUALIZARI (
                             id                  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                             id_client           INTEGER NOT NULL,
                             id_film             INTEGER NOT NULL,
                             id_versiune         INTEGER NOT NULL,
                             data_vizualizare    DATE NOT NULL DEFAULT CURRENT_DATE,
                             durata_vizualizata  INTEGER,
                             stare               VARCHAR(20) DEFAULT 'INCOMPLETA',

                             CONSTRAINT fk_viz_client FOREIGN KEY (id_client) REFERENCES CLIENTI(id) ON DELETE CASCADE,
                             CONSTRAINT fk_viz_film FOREIGN KEY (id_film) REFERENCES FILME(id) ON DELETE CASCADE,
                             CONSTRAINT fk_viz_versiune FOREIGN KEY (id_versiune) REFERENCES VERSIUNI_FILM(id),
                             CONSTRAINT chk_stare CHECK (stare IN ('COMPLETA', 'INCOMPLETA')),
                             CONSTRAINT chk_durata CHECK (durata_vizualizata >= 0)
);
CREATE TABLE VOTURI (
                        id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                        id_client   INTEGER NOT NULL,
                        id_film     INTEGER NOT NULL,
                        valoare     INTEGER NOT NULL,
                        data_vot    DATE NOT NULL DEFAULT CURRENT_DATE,

                        CONSTRAINT fk_vot_client FOREIGN KEY (id_client) REFERENCES CLIENTI(id) ON DELETE CASCADE,
                        CONSTRAINT fk_vot_film FOREIGN KEY (id_film) REFERENCES FILME(id) ON DELETE CASCADE,
                        CONSTRAINT uq_vot UNIQUE (id_client, id_film),
                        CONSTRAINT chk_valoare_vot CHECK (valoare BETWEEN 1 AND 10)
);
CREATE TABLE COMENTARII (
                            id                  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                            id_client           INTEGER NOT NULL,
                            id_film             INTEGER NOT NULL,
                            text_comentariu     VARCHAR(2000),
                            data_comentariu     DATE NOT NULL DEFAULT CURRENT_DATE,
                            sentiment           VARCHAR(10) DEFAULT 'NEUTRU',

                            CONSTRAINT fk_com_client FOREIGN KEY (id_client) REFERENCES CLIENTI(id) ON DELETE CASCADE,
                            CONSTRAINT fk_com_film FOREIGN KEY (id_film) REFERENCES FILME(id) ON DELETE CASCADE,
                            CONSTRAINT chk_sentiment CHECK (sentiment IN ('POZITIV', 'NEGATIV', 'NEUTRU'))
);
CREATE TABLE OPTIUNI_PREDEFINITE (
                                     id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                     denumire    VARCHAR(100) NOT NULL UNIQUE,
                                     tip         VARCHAR(10) NOT NULL,

                                     CONSTRAINT chk_tip_optiune CHECK (tip IN ('POZITIV', 'NEGATIV', 'NEUTRU'))
);

CREATE TABLE CLIENT_OPTIUNI (
                                id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                id_client   INTEGER NOT NULL,
                                id_film     INTEGER NOT NULL,
                                id_optiune  INTEGER NOT NULL,
                                data        DATE NOT NULL DEFAULT CURRENT_DATE,

                                CONSTRAINT fk_co_client FOREIGN KEY (id_client) REFERENCES CLIENTI(id) ON DELETE CASCADE,
                                CONSTRAINT fk_co_film FOREIGN KEY (id_film) REFERENCES FILME(id) ON DELETE CASCADE,
                                CONSTRAINT fk_co_optiune FOREIGN KEY (id_optiune) REFERENCES OPTIUNI_PREDEFINITE(id),
                                CONSTRAINT uq_client_optiune UNIQUE (id_client, id_film, id_optiune)
);
CREATE TABLE RECOMANDARI (
                             id                      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                             id_client               INTEGER NOT NULL,
                             id_film                 INTEGER NOT NULL,
                             scor_compatibilitate    DECIMAL(5,2),
                             motiv                   VARCHAR(500),
                             data_generare           DATE NOT NULL DEFAULT CURRENT_DATE,
                             vizualizata             CHAR(1) DEFAULT 'N',

                             CONSTRAINT fk_rec_client FOREIGN KEY (id_client) REFERENCES CLIENTI(id) ON DELETE CASCADE,
                             CONSTRAINT fk_rec_film FOREIGN KEY (id_film) REFERENCES FILME(id) ON DELETE CASCADE,
                             CONSTRAINT uq_recomandare UNIQUE (id_client, id_film),
                             CONSTRAINT chk_scor CHECK (scor_compatibilitate BETWEEN 0 AND 100),
                             CONSTRAINT chk_vizualizata CHECK (vizualizata IN ('Y', 'N'))
);

INSERT INTO OPTIUNI_PREDEFINITE (denumire, tip) VALUES
    ('interesant', 'POZITIV'),
    ('emotionant', 'POZITIV'),
    ('plictisitor', 'NEGATIV'),
    ('actor principal apreciat', 'POZITIV'),
    ('scenariu slab', 'NEGATIV')
ON CONFLICT (denumire) DO NOTHING;
