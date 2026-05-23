package com.watchflix.demo.dto;

import com.watchflix.demo.model.Actor;
import com.watchflix.demo.model.Comentariu;
import com.watchflix.demo.model.Film;
import com.watchflix.demo.model.Versiune;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FilmDetailsDTO {
    private Film film;
    private List<Versiune> versiuni;
    private List<Comentariu> comentarii;
    private List<Actor> actori;

}