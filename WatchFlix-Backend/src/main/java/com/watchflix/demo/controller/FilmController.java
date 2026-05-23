package com.watchflix.demo.controller;

import com.watchflix.demo.model.Film;
import com.watchflix.demo.model.FilmPopular;
import com.watchflix.demo.repository.FilmRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/filme")
public class FilmController {
    private final FilmRepository filmRepository;
    public FilmController(FilmRepository filmRepository) {
        this.filmRepository = filmRepository;
    }

    @GetMapping
    public List<Film> getAllMovies(@RequestParam int page,@RequestParam int size){
        return filmRepository.findAll(page,size);
    }
    @GetMapping("/{id}")
    public ResponseEntity<Film> getMovieById(@PathVariable int id)
    {
        Film film = filmRepository.findById(id);
        if(film == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(film);
    }
    @GetMapping("/populare")
    public List<FilmPopular> getFilmePopulare(@RequestParam(defaultValue = "10") int limit)
    {
        return filmRepository.getFilmePopulare(limit);
    }
    @GetMapping("/search")
    public List<Film> getMoviesByName(@RequestParam String title){
        return filmRepository.findByTitlu(title);
    }
    @GetMapping("/categorie/{id}")
    public  List<Film> getMoviesByCategorie(@PathVariable int id,@RequestParam int page,@RequestParam int size)
    {
        return filmRepository.findByCategorie(id,page,size);
    }
    @PostMapping
    public ResponseEntity<Film> createFilm(@RequestBody Film film){
        Film saved = filmRepository.save(film);
        return ResponseEntity.ok(saved);
    }
    @PutMapping("/{id}")
    public  ResponseEntity<Film> updateFilm(@PathVariable int id,@RequestBody Film film){
        film.setId(id);
        int rows = filmRepository.update(film);
        if (rows == 0) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(film);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFilm(@PathVariable int id) {
        int rows = filmRepository.delete(id);
        if (rows == 0) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }
}
