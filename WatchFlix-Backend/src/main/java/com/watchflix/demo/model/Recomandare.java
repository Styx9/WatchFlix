package com.watchflix.demo.model;

import lombok.Getter;
import lombok.Setter;

import java.sql.Time;
import java.sql.Timestamp;

@Setter
@Getter
public class Recomandare {
    private int id;
    private int idClient;
    private int idFilm;
    private int scorCompatibilitate;
    private String motiv;
    private Timestamp dataGenerare;
    private boolean vizualizata;
}
