package com.watchflix.demo.controller;

import com.watchflix.demo.repository.StatisticiRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/statistici")
public class StatisticiController {
    private final StatisticiRepository statisticiRepository;

    public StatisticiController(StatisticiRepository statisticiRepository) {
        this.statisticiRepository = statisticiRepository;
    }

    @GetMapping("/sentiment/film/{idFilm}")
    public List<Map<String, Object>> getSentimentFilm(@PathVariable int idFilm) {
        return statisticiRepository.getSentimentFilm(idFilm);
    }

    @GetMapping("/sentiment/categorie/{idCategorie}")
    public List<Map<String, Object>> getSentimentCategorie(@PathVariable int idCategorie) {
        return statisticiRepository.getSentimentCategorie(idCategorie);
    }

    @GetMapping("/sentiment/actor/{idActor}")
    public List<Map<String, Object>> getSentimentActor(@PathVariable int idActor) {
        return statisticiRepository.getSentimentActor(idActor);
    }

    @GetMapping("/grupare-clienti")
    public List<Map<String, Object>> getGrupareClienti() {
        return statisticiRepository.getGrupareClienti();
    }

    @GetMapping("/predictii-sezoniere")
    public List<Map<String, Object>> getPredictiiSezoniere(
            @RequestParam int lunaStart,
            @RequestParam int lunaEnd,
            @RequestParam(defaultValue = "10") int limit) {
        return statisticiRepository.getPredictiiSezoniere(lunaStart, lunaEnd, limit);
    }
}
