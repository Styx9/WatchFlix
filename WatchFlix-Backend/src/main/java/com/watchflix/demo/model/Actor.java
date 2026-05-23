package com.watchflix.demo.model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Actor {
    private int id;
    private String numeScena;
    private String prenume;
    private String numeFamilie;
    private LocalDate dataNastere;
    private String poza;
}

