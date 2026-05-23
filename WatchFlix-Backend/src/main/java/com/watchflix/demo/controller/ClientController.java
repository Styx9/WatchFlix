package com.watchflix.demo.controller;

import com.watchflix.demo.model.Client;
import com.watchflix.demo.model.IstoricClient;
import com.watchflix.demo.model.ProfilClient;
import com.watchflix.demo.model.Recomandare;
import com.watchflix.demo.repository.ClientRepository;
import com.watchflix.demo.repository.RecomandariRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clienti")
public class ClientController {
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final ClientRepository clientRepository;
    private final RecomandariRepository recomandariRepository;

    public ClientController(ClientRepository clientRepository,
                            RecomandariRepository recomandariRepository) {
        this.clientRepository = clientRepository;
        this.recomandariRepository = recomandariRepository;
    }

    @GetMapping
    public List<Client> getAllClienti() {
        return clientRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Client> getClientById(@PathVariable int id) {
        Client client = clientRepository.findById(id);
        if (client == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(client);
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String username,
                                   @RequestParam String parola) {
        Client client = clientRepository.findByUsername(username);
        if (client == null || !passwordEncoder.matches(parola, client.getParola())) {
            return ResponseEntity.status(401).body("Username sau parola incorecte.");
        }
        client.setParola(null);
        return ResponseEntity.ok(client);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Client client) {
        if (clientRepository.findByUsername(client.getUsername()) != null) {
            return ResponseEntity.badRequest().body("Username-ul este deja folosit.");
        }
        if (client.getEmail() != null &&
                clientRepository.findByEmail(client.getEmail()) != null) {
            return ResponseEntity.badRequest().body("Email-ul este deja folosit.");
        }
        client.setParola(passwordEncoder.encode(client.getParola()));
        Client saved = clientRepository.save(client);
        saved.setParola(null);
        return ResponseEntity.ok(saved);
    }
    @GetMapping("/{id}/profil")
    public ResponseEntity<ProfilClient> getProfilClient(@PathVariable int id) {
        ProfilClient profil = clientRepository.getProfilClient(id);
        if (profil == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(profil);
    }

    @GetMapping("/{id}/istoric")
    public ResponseEntity<List<IstoricClient>> getIstoricClient(@PathVariable int id) {
        List<IstoricClient> istoric = clientRepository.getIstoricClient(id);
        return ResponseEntity.ok(istoric);
    }

    @GetMapping("/{id}/recomandari")
    public ResponseEntity<List<Recomandare>> getRecomandariClient(@PathVariable int id) {
        List<Recomandare> recomandari = recomandariRepository.findByClient(id);
        return ResponseEntity.ok(recomandari);
    }

    @PostMapping
    public ResponseEntity<?> createClient(@RequestBody Client client) {
        if (client.getEmail() != null) {
            Client existent = clientRepository.findByEmail(client.getEmail());
            if (existent != null) {
                return ResponseEntity.badRequest().body("Email-ul este deja folosit.");
            }
        }
        Client saved = clientRepository.save(client);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Client> updateClient(@PathVariable int id, @RequestBody Client client) {
        client.setId(id);
        int rows = clientRepository.update(client);
        if (rows == 0) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(clientRepository.findById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable int id) {
        int rows = clientRepository.delete(id);
        if (rows == 0) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }
}
