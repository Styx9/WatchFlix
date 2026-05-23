package com.watchflix.demo.controller;

import com.watchflix.demo.model.Versiune;
import com.watchflix.demo.repository.VersiuneRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/versiuni")
public class VersiuneController {
    private final VersiuneRepository versiuneRepository;

    public VersiuneController(VersiuneRepository versiuneRepository) {
        this.versiuneRepository = versiuneRepository;
    }

    @GetMapping("/film/{idFilm}")
    public List<Versiune> getVersiuniByFilm(@PathVariable int idFilm) {
        return versiuneRepository.findByFilm(idFilm);
    }

    @PostMapping
    public ResponseEntity<Versiune> createVersiune(@RequestBody Versiune versiune) {
        return ResponseEntity.ok(versiuneRepository.save(versiune));
    }
}
