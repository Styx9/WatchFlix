package com.watchflix.demo.service;

import com.watchflix.demo.model.Recomandare;
import com.watchflix.demo.repository.RecomandariRepository;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.sql.SQLException;
import java.util.List;

public class RecomandariService {
    private final RecomandariRepository recomandariRepository;
    public RecomandariService(RecomandariRepository recomandariRepository){
        this.recomandariRepository = recomandariRepository;
    }
    public void genereazaRecomandari(int idClient){
        try{
            recomandariRepository.genereazaRecomandari(idClient);
        }catch (DataAccessException e){
            Throwable rootCause = e.getRootCause();
            if(rootCause instanceof SQLException sqlException){
                String state = sqlException.getSQLState();
                if("P0001".equals(state))
                {
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND,sqlException.getMessage());
                }
                else if ("P0002".equals(state)){
                    throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_CONTENT,sqlException.getMessage());
                }
            }throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,"Eroare la generarea de recomandari");
        }
    }
    public List<Recomandare> getRecomandariClient(int idClient) {
        return recomandariRepository.findByClient(idClient);
    }
    public void marcheazaVazuta(int idClient, int idFilm) {
        recomandariRepository.markVizualizata(idClient, idFilm);
    }
}
