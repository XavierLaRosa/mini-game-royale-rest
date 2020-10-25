package com.xavieralarosa.minigameroyalerest.controllers;

import com.xavieralarosa.minigameroyalerest.models.AuthenticationRequest;
import com.xavieralarosa.minigameroyalerest.models.AuthenticationResponse;
import com.xavieralarosa.minigameroyalerest.models.CategoriesGame;
import com.xavieralarosa.minigameroyalerest.services.MyUserDetailsService;
import com.xavieralarosa.minigameroyalerest.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private MyUserDetailsService userDetailService;

    @Autowired
    private JwtUtil jwtToken;

    // test hello endpoint method
    @RequestMapping({"/hello"})
    public String hello() {
        return "Hello world";
    }

    // authenticated endpoint method
    @RequestMapping(value = "/authenticate", method = RequestMethod.POST)
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthenticationRequest authenticationRequest) throws Exception {

       try { // payload in the post body that contains username and password
           authenticationManager.authenticate(
                   new UsernamePasswordAuthenticationToken(authenticationRequest.getUsername(), authenticationRequest.getPassword())
                   );

       } catch (BadCredentialsException e) { // if it does not authenticate
           throw new Exception("Incorrect username or password", e);
       } // if it does then we create a JWT token
       final UserDetails userDetails = userDetailService
                .loadUserByUsername(authenticationRequest.getUsername());
       final String jwt = jwtToken.generateToken(userDetails);
       return ResponseEntity.ok(new AuthenticationResponse(jwt)); // send back a response
    }

}
