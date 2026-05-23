package com.watchflix.demo.model;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class Vot {
    private int id;
    private int idClient;
    private int idFilm;
    private int valoare;
    private LocalDate dataVot;
}
