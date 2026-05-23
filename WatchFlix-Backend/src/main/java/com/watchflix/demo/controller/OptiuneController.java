package com.watchflix.demo.controller;

import com.watchflix.demo.model.ClientOptiune;
import com.watchflix.demo.model.OptiunePredefinita;
import com.watchflix.demo.repository.OptiuneRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/optiuni")
public class OptiuneController {
    private final OptiuneRepository optiuneRepository;

    public OptiuneController(OptiuneRepository optiuneRepository) {
        this.optiuneRepository = optiuneRepository;
    }

    @GetMapping
    public List<OptiunePredefinita> getOptiuni() {
        return optiuneRepository.findAll();
    }

    @GetMapping("/client")
    public List<ClientOptiune> getOptiuniClient(@RequestParam int idClient, @RequestParam int idFilm) {
        return optiuneRepository.findByClientAndFilm(idClient, idFilm);
    }

    @PostMapping("/client")
    public ResponseEntity<List<ClientOptiune>> saveOptiuniClient(@RequestBody ClientOptiuniRequest request) {
        optiuneRepository.replaceForClientAndFilm(request.idClient(), request.idFilm(), request.idOptiuni());
        return ResponseEntity.ok(optiuneRepository.findByClientAndFilm(request.idClient(), request.idFilm()));
    }

    public record ClientOptiuniRequest(int idClient, int idFilm, List<Integer> idOptiuni) {
    }
}
