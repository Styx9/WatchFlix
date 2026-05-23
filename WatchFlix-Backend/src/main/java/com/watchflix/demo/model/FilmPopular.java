package com.watchflix.demo.model;

import lombok.Setter;

import java.sql.Timestamp;

@Setter
public class FilmPopular {
    private int idFilm;
    private String titlu;
    private String categorie;
    private double rating;
    private int nrVizualizari;
    private int nrVoturi;
    private double scorPopularitate;
}
