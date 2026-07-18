package com.gitcollab.manager.service;

import com.gitcollab.manager.model.GithubUser;
import com.gitcollab.manager.repository.GithubUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CollaboratorService {

    @Autowired
    private GithubUserRepository githubUserRepository;

    public List<GithubUser> listCollaborators(String search) {
        return githubUserRepository.searchCollaborators(search != null ? search.trim() : "");
    }
}
