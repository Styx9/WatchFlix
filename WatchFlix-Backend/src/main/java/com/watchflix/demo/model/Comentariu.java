package com.watchflix.demo.model;

import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;
import java.time.LocalDate;

@Setter
@Getter
public class Comentariu {
    private int id;
    private int idClient;
    private int idFilm;
    private String textComentariu;
    private LocalDate dataComentariu;
    private String sentiment;
    private String username;
    private String numeClient;
}
