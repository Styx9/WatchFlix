package com.watchflix.demo.model;

import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;
import java.time.LocalDate;

@Setter
@Getter
public class IstoricClient {
    private int idFilm;
    private Integer idVizualizare;
    private String titlu;
    private String categorie;
    private LocalDate dataVizualizare;
    private String versiune;
    private String stare;
    private Double votAcordat;
    private String comentariu;
    private String sentiment;
}
