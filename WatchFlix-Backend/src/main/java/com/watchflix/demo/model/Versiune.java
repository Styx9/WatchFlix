package com.watchflix.demo.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Versiune {
    private int id;
    private int idFilm;
    private String rezolutie;
    private String limba;
    private String format;
    private boolean disponibila;
}
