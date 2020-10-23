package com.xavieralarosa.minigameroyalerest.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {
    @Id
    private String _id;
    private String username;
    private String password;
    private String[] friends;
    private String[] pending_friends_sent;
    private String[] pending_friends_received;
    private String[] pending_game_invites;
    private String[] active_games;
    private String[] games;

    // when creating a new user
    public User(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // when receiving an existing user
    public User(String _id, String username, String password, String[] friends, String[] pending_friends_sent, String[] pending_friends_received, String[] pending_game_invites, String[] active_games, String[] games) {
        this._id = _id;
        this.username = username;
        this.password = password;
        this.friends = friends;
        this.pending_friends_sent = pending_friends_sent;
        this.pending_friends_received = pending_friends_received;
        this.pending_game_invites = pending_game_invites;
        this.active_games = active_games;
        this.games = games;
    }
}
