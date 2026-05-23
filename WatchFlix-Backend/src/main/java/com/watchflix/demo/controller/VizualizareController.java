package com.watchflix.demo.controller;

import com.watchflix.demo.model.Vizualizare;
import com.watchflix.demo.repository.RecomandariRepository;
import com.watchflix.demo.repository.VizualizareRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vizualizari")
public class VizualizareController {
    private final VizualizareRepository vizualizareRepository;
    private final RecomandariRepository recomandariRepository;

    public VizualizareController(VizualizareRepository vizualizareRepository,
                                 RecomandariRepository recomandariRepository) {
        this.vizualizareRepository = vizualizareRepository;
        this.recomandariRepository = recomandariRepository;
    }

    @PostMapping
    public ResponseEntity<Vizualizare> addVizualizare(@RequestBody Vizualizare vizualizare) {
        Vizualizare saved = vizualizareRepository.save(vizualizare);
        recomandariRepository.markVizualizata(saved.getIdClient(), saved.getIdFilm());
        try {
            recomandariRepository.genereazaRecomandari(saved.getIdClient());
        } catch (RuntimeException ignored) {
            // Un client nou poate sa nu aiba inca destule date pentru recomandari.
        }
        return ResponseEntity.ok(saved);
    }
}
