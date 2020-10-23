package com.xavieralarosa.minigameroyalerest.services;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class MyUserDetailsService implements UserDetailsService { // spring service

    // called to load a user by username
    @Override
    public UserDetails loadUserByUsername(String userName) throws UsernameNotFoundException {
        // hard coded, but should be connected to Mongodb later
        return new User("user","user", new ArrayList<>());
    }
}
