package com.watchflix.demo.service;

import com.watchflix.demo.model.Client;
import com.watchflix.demo.repository.ClientRepository;
import com.watchflix.demo.repository.RecomandariRepository;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@Service
public class ClientService {
    private final ClientRepository clientRepository;
    private final RecomandariRepository recomandariRepository;

    public ClientService(ClientRepository clientRepository,RecomandariRepository recomandariRepository){
        this.clientRepository = clientRepository;
        this.recomandariRepository = recomandariRepository;
    }
    public Client registerClient(Client client){
        if(client.getEmail() == null || !client.getEmail().contains("@")){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Email invalid");
        }
        return clientRepository.save(client);
    }
    public Map<String, Object> getFullDashboard(int idClient){
        Client client = clientRepository.findById(idClient);
        if(client == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Clientul nu exista");
        }
            Map<String,Object> dashboard = new HashMap<>();
            dashboard.put("info",client);
            dashboard.put("profil",clientRepository.getProfilClient(idClient));
            dashboard.put("istoric",clientRepository.getIstoricClient(idClient));
            dashboard.put("recomandari",recomandariRepository.findByClient(idClient));
        return dashboard;
    }

}
