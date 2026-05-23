package com.watchflix.demo.model;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class Vizualizare {
    private int id;
    private int idClient;
    private int idFilm;
    private int idVersiune;
    private LocalDate dataVizualizare;
    private Integer durataVizualizata;
    private String stare;
}
