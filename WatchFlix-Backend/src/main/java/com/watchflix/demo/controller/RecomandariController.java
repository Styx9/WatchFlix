package com.watchflix.demo.controller;

import com.watchflix.demo.model.Recomandare;
import com.watchflix.demo.repository.RecomandariRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recomandari")
public class RecomandariController {

    private final RecomandariRepository recomandariRepository;

    public RecomandariController(RecomandariRepository recomandariRepository) {
        this.recomandariRepository = recomandariRepository;
    }
    @PostMapping("/genereaza/{idClient}")
    public ResponseEntity<String> genereazaRecomandari(@PathVariable int idClient) {
        recomandariRepository.genereazaRecomandari(idClient);
        return ResponseEntity.ok("Recomandari generate cu succes pentru clientul " + idClient);
    }
    @GetMapping("/{idClient}")
    public ResponseEntity<List<Recomandare>> getRecomandari(@PathVariable int idClient) {
        List<Recomandare> recomandari = recomandariRepository.findByClient(idClient);
        return ResponseEntity.ok(recomandari);
    }
    @PutMapping("/vizualizata")
    public ResponseEntity<Void> markVizualizata(@RequestParam int idClient,
                                                @RequestParam int idFilm) {
        int rows = recomandariRepository.markVizualizata(idClient, idFilm);
        if (rows == 0) return ResponseEntity.notFound().build();
        return ResponseEntity.ok().build();
    }
}