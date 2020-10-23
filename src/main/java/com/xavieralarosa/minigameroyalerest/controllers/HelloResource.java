package com.xavieralarosa.minigameroyalerest.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloResource {

    @RequestMapping({"/hello"})
    public String hello() {
        System.out.println("In hello method");
        return "Hello world";
    }
}
