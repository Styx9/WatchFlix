package com.watchflix.demo.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.time.LocalDate;

@Setter
@Getter
@NoArgsConstructor
public class Film {
    private int id;
    private String titlu;
    private String descriere;
    private int idCategorie;
    private String categorie;
    private LocalDate dataLansare;
    private double rating;
    private String posterUrl;

    public Film(String titlu, String descriere, int idCategorie, LocalDate dataLansare, String posterUrl) {
        this.titlu = titlu;
        this.descriere = descriere;
        this.dataLansare = dataLansare;
        this.posterUrl = posterUrl;
        this.rating = 0;
    }
}
