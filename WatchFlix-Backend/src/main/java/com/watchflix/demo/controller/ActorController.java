package com.watchflix.demo.controller;

import com.watchflix.demo.model.Actor;
import com.watchflix.demo.model.Film;
import com.watchflix.demo.repository.ActorRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/actori")
public class ActorController {

    private final ActorRepository actorRepository;

    public ActorController(ActorRepository actorRepository) {
        this.actorRepository = actorRepository;
    }
    @GetMapping
    public List<Actor> getAllActori() {
        return actorRepository.findAll();
    }
    @GetMapping("/{id}")
    public ResponseEntity<Actor> getActorById(@PathVariable int id) {
        Actor actor = actorRepository.findById(id);
        if (actor == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(actor);
    }
    @GetMapping("/film/{idFilm}")
    public List<Actor> getActoriByFilm(@PathVariable int idFilm) {
        return actorRepository.findByFilm(idFilm);
    }
    @GetMapping("/{id}/filme")
    public List<Film> getFilmeByActor(@PathVariable int id) {
        return actorRepository.findFilmeByActor(id);
    }
    @PostMapping
    public ResponseEntity<Actor> createActor(@RequestBody Actor actor) {
        Actor saved = actorRepository.save(actor);
        return ResponseEntity.ok(saved);
    }
}
