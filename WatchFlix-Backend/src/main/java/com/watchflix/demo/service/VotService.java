package com.watchflix.demo.service;

import com.watchflix.demo.model.Vot;
import com.watchflix.demo.repository.VotRepository;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.sql.SQLException;

@Service
public class VotService {

    private final VotRepository votRepository;

    public VotService(VotRepository votRepository) {
        this.votRepository = votRepository;
    }

    public void adaugaVot(int idClient, int idFilm, int valoare) {
        try {
            votRepository.addVot(idClient, idFilm, valoare);
        } catch (DataAccessException e) {
            Throwable rootCause = e.getRootCause();
            if (rootCause instanceof SQLException sqlEx) {
                String sqlState = sqlEx.getSQLState();

                switch (sqlState) {
                    case "P0001", "P0004":
                        throw new ResponseStatusException(HttpStatus.NOT_FOUND, sqlEx.getMessage());
                    case "P0005":
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, sqlEx.getMessage());
                    default:
                        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Eroare baza de date: " + sqlEx.getMessage());
                }
            }
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Eroare neprevazuta la procesarea votului.");
        }
    }

    public Vot obtineVotClient(int idClient, int idFilm) {
        Vot vot = votRepository.getVotClient(idClient, idFilm);
        if (vot == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Votul nu a fost gasit.");
        }
        return vot;
    }

    public void stergeVot(int idClient, int idFilm) {
        int affectedRows = votRepository.deleteVot(idClient, idFilm);
        if (affectedRows == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nu s-a putut sterge: votul nu exista.");
        }
    }
}