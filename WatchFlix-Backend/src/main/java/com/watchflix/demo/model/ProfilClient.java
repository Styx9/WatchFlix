package com.watchflix.demo.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Service;

@Setter
@Getter
public class ProfilClient {
    private String categoriePreferata;
    private String actorPreferat;
    private int totalFilmeVazute;
    private int totalFilmeVotate;
    private double ratingMediuAcordat;
    private String sentimentDominant;
}
