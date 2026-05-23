package com.watchflix.demo.model;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ClientOptiune {
    private int id;
    private int idClient;
    private int idFilm;
    private int idOptiune;
    private String denumire;
    private String tip;
    private LocalDate data;
}
