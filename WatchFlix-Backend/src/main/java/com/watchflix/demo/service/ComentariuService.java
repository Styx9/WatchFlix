package com.watchflix.demo.service;

import com.watchflix.demo.model.Comentariu;
import com.watchflix.demo.repository.ComentariuRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

public class ComentariuService {
    private final ComentariuRepository comentariuRepository;

    public ComentariuService(ComentariuRepository comentariuRepository){
        this.comentariuRepository = comentariuRepository;
    }
    public List<Comentariu> getComentariiFilm(int idFilm){
        return comentariuRepository.findByFilm(idFilm);
    }
    public Comentariu addComentariu(Comentariu comentariu){
        if(comentariu.getTextComentariu() == null || comentariu.getTextComentariu().length() < 3)
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Comentariul este prea scurt");
        }
        return comentariuRepository.save(comentariu);
    }
    public void stergeComentariu(int id)
    {
        int deleted = comentariuRepository.delete(id);
        if(deleted == 0)
        {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Comentariul nu a fost gasit");
        }
    }
}
