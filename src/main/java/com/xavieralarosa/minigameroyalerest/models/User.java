package com.xavieralarosa.minigameroyalerest.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Arrays;

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

    public String get_id() {
        return _id;
    }

    public void set_id(String _id) {
        this._id = _id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String[] getFriends() {
        return friends;
    }

    public void setFriends(String[] friends) {
        this.friends = friends;
    }

    public String[] getPending_friends_sent() {
        return pending_friends_sent;
    }

    public void setPending_friends_sent(String[] pending_friends_sent) {
        this.pending_friends_sent = pending_friends_sent;
    }

    public String[] getPending_friends_received() {
        return pending_friends_received;
    }

    public void setPending_friends_received(String[] pending_friends_received) {
        this.pending_friends_received = pending_friends_received;
    }

    public String[] getPending_game_invites() {
        return pending_game_invites;
    }

    public void setPending_game_invites(String[] pending_game_invites) {
        this.pending_game_invites = pending_game_invites;
    }

    public String[] getActive_games() {
        return active_games;
    }

    public void setActive_games(String[] active_games) {
        this.active_games = active_games;
    }

    public String[] getGames() {
        return games;
    }

    public void setGames(String[] games) {
        this.games = games;
    }

    @Override
    public String toString() {
        return "User{" +
                "_id='" + _id + '\'' +
                ", username='" + username + '\'' +
                ", password='" + password + '\'' +
                ", friends=" + Arrays.toString(friends) +
                ", pending_friends_sent=" + Arrays.toString(pending_friends_sent) +
                ", pending_friends_received=" + Arrays.toString(pending_friends_received) +
                ", pending_game_invites=" + Arrays.toString(pending_game_invites) +
                ", active_games=" + Arrays.toString(active_games) +
                ", games=" + Arrays.toString(games) +
                '}';
    }
}
