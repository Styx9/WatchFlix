package com.watchflix.demo.service;

import com.watchflix.demo.dto.FilmDetailsDTO;
import com.watchflix.demo.model.*;
import com.watchflix.demo.repository.ActorRepository;
import com.watchflix.demo.repository.ComentariuRepository;
import com.watchflix.demo.repository.FilmRepository;
import com.watchflix.demo.repository.VersiuneRepository;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
@Service
public class FilmService {
    private final FilmRepository filmRepository;
    private final VersiuneRepository versiuneRepository;
    private final ActorRepository actorRepository;
    private final ComentariuRepository comentariuRepository;
    public FilmService(FilmRepository filmRepository,VersiuneRepository versiuneRepository,ActorRepository actorRepository,ComentariuRepository comentariuRepository){
        this.filmRepository = filmRepository;
        this.versiuneRepository =versiuneRepository;
        this.actorRepository = actorRepository;
        this.comentariuRepository = comentariuRepository;
    }
    public List<Film> getAllFilme(int page,int size){
        return filmRepository.findAll(page,size);
    }
    public Film getFilmById(int id){
        Film film = filmRepository.findById(id);
        if (film == null)
        {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Filmul cu ID-ul " + id + " nu a fost gasit.");
        }
        return film;
    }
    public FilmDetailsDTO getFilmDetails(int id){
        Film film = getFilmById(id);
        List<Versiune> versiuni = versiuneRepository.findByFilm(id);
        List<Actor> actori = actorRepository.findByFilm(id);
        List<Comentariu> comentarii = comentariuRepository.findByFilm(id);
        return new FilmDetailsDTO(film,versiuni,comentarii,actori);
    }
    public Film saveFilm(Film film){
        if(film.getTitlu() == null || film.getTitlu().isBlank())
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Titlul filmului este obligatoriu");
        }
        if (film.getRating() < 0 || film.getRating() > 10){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Rating-ul trebuie sa fie intre 0 si 10");
        }
        return filmRepository.save(film);
    }
    public void updateFilm(Film film) {
        getFilmById(film.getId());
        int rowsAffected = filmRepository.update(film);
        if (rowsAffected == 0) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Update-ul a eșuat.");
        }
    }
    public void deleteFilm(int id) {
        int rowsAffected = filmRepository.delete(id);
        if (rowsAffected == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nu s-a putut șterge: filmul nu există.");
        }
    }

    public List<FilmPopular> getFilmePopulare(int limit) {
        if (limit <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Limita trebuie să fie pozitivă.");
        }
        return filmRepository.getFilmePopulare(limit);
    }
}
