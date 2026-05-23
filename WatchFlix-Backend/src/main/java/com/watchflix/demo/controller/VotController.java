package com.watchflix.demo.controller;

import com.watchflix.demo.model.Vot;
import com.watchflix.demo.repository.VotRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/voturi")
public class VotController {

    private final VotRepository votRepository;

    public VotController(VotRepository votRepository) {
        this.votRepository = votRepository;
    }
    @PostMapping
    public ResponseEntity<Void> addVot(@RequestParam int idClient,
                                       @RequestParam int idFilm,
                                       @RequestParam int valoare) {
        votRepository.addVot(idClient, idFilm, valoare);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<Vot> getVotClient(@RequestParam int idClient,
                                            @RequestParam int idFilm) {
        Vot vot = votRepository.getVotClient(idClient, idFilm);
        if (vot == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(vot);
    }
    @GetMapping("/film/{idFilm}")
    public List<Vot> getVoturiByFilm(@PathVariable int idFilm) {
        return votRepository.getVoturiByFilm(idFilm);
    }
    @DeleteMapping
    public ResponseEntity<Void> deleteVot(@RequestParam int idClient,
                                          @RequestParam int idFilm) {
        int rows = votRepository.deleteVot(idClient, idFilm);
        if (rows == 0) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }
}