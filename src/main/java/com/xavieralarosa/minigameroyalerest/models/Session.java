package com.xavieralarosa.minigameroyalerest.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "sessions")
public class Session {
    @Id
    private String _id;
    private String game_id;
    private String player_1_id;
    private int player_1_wins;
    private String player_2_id;
    private int player_2_wins;

    // when creating a new session
    public Session(String game_id, String player_1_id, int player_1_wins, String player_2_id, int player_2_wins) {
        this.game_id = game_id;
        this.player_1_id = player_1_id;
        this.player_1_wins = player_1_wins;
        this.player_2_id = player_2_id;
        this.player_2_wins = player_2_wins;
    }

    // when receiving an existing session
    public Session(String _id, String game_id, String player_1_id, int player_1_wins, String player_2_id, int player_2_wins) {
        this._id = _id;
        this.game_id = game_id;
        this.player_1_id = player_1_id;
        this.player_1_wins = player_1_wins;
        this.player_2_id = player_2_id;
        this.player_2_wins = player_2_wins;
    }

    public String get_id() {
        return _id;
    }

    public void set_id(String _id) {
        this._id = _id;
    }

    public String getGame_id() {
        return game_id;
    }

    public void setGame_id(String game_id) {
        this.game_id = game_id;
    }

    public String getPlayer_1_id() {
        return player_1_id;
    }

    public void setPlayer_1_id(String player_1_id) {
        this.player_1_id = player_1_id;
    }

    public int getPlayer_1_wins() {
        return player_1_wins;
    }

    public void setPlayer_1_wins(int player_1_wins) {
        this.player_1_wins = player_1_wins;
    }

    public String getPlayer_2_id() {
        return player_2_id;
    }

    public void setPlayer_2_id(String player_2_id) {
        this.player_2_id = player_2_id;
    }

    public int getPlayer_2_wins() {
        return player_2_wins;
    }

    public void setPlayer_2_wins(int player_2_wins) {
        this.player_2_wins = player_2_wins;
    }

    @Override
    public String toString() {
        return "Session{" +
                "_id='" + _id + '\'' +
                ", game_id='" + game_id + '\'' +
                ", player_1_id='" + player_1_id + '\'' +
                ", player_1_wins=" + player_1_wins +
                ", player_2_id='" + player_2_id + '\'' +
                ", player_2_wins=" + player_2_wins +
                '}';
    }
}
