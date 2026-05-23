package com.watchflix.demo.controller;

import com.watchflix.demo.model.Comentariu;
import com.watchflix.demo.repository.ComentariuRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comentarii")
public class ComentariuController {

    private final ComentariuRepository comentariuRepository;

    public ComentariuController(ComentariuRepository comentariuRepository) {
        this.comentariuRepository = comentariuRepository;
    }
    @GetMapping("/film/{idFilm}")
    public List<Comentariu> getComentariiByFilm(@PathVariable int idFilm) {
        return comentariuRepository.findByFilm(idFilm);
    }
    @GetMapping("/client/{idClient}")
    public List<Comentariu> getComentariiByClient(@PathVariable int idClient) {
        return comentariuRepository.findByClient(idClient);
    }
    @PostMapping
    public ResponseEntity<Comentariu> addComentariu(@RequestBody Comentariu comentariu) {
        Comentariu saved = comentariuRepository.save(comentariu);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComentariu(@PathVariable int id) {
        int rows = comentariuRepository.delete(id);
        if (rows == 0) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }
}