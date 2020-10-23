package com.xavieralarosa.minigameroyalerest.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "games")
public class CategoriesGame {
    @Id
    private String _id;
    private String name;
    private String type_id;
    private String genre_id;
    private String current_turn_id;
    private String player_1_id;
    private int player_1_points;
    private String player_2_id;
    private int player_2_points;
    private String[] verified_answers;
    private int round;
    private int max_round;

    // when creating a new category
    public CategoriesGame(String type_id, String genre_id, String current_turn_id, String player_1_id, int player_1_points, String player_2_id, int player_2_points, int round, int max_round) {
        this.type_id = type_id;
        this.genre_id = genre_id;
        this.current_turn_id = current_turn_id;
        this.player_1_id = player_1_id;
        this.player_1_points = player_1_points;
        this.player_2_id = player_2_id;
        this.player_2_points = player_2_points;
        this.round = round;
        this.max_round = max_round;
    }

    // when receiving an existing category
    public CategoriesGame(String _id, String name, String type_id, String genre_id, String current_turn_id, String player_1_id, int player_1_points, String player_2_id, int player_2_points, String[] verified_answers, int round, int max_round) {
        this._id = _id;
        this.name = name;
        this.type_id = type_id;
        this.genre_id = genre_id;
        this.current_turn_id = current_turn_id;
        this.player_1_id = player_1_id;
        this.player_1_points = player_1_points;
        this.player_2_id = player_2_id;
        this.player_2_points = player_2_points;
        this.verified_answers = verified_answers;
        this.round = round;
        this.max_round = max_round;
    }

    public String getType_id() {
        return type_id;
    }

    public void setType_id(String type_id) {
        this.type_id = type_id;
    }

    public String getGenre_id() {
        return genre_id;
    }

    public void setGenre_id(String genre_id) {
        this.genre_id = genre_id;
    }

    public String getCurrent_turn_id() {
        return current_turn_id;
    }

    public void setCurrent_turn_id(String current_turn_id) {
        this.current_turn_id = current_turn_id;
    }

    public String getPlayer_1_id() {
        return player_1_id;
    }

    public void setPlayer_1_id(String player_1_id) {
        this.player_1_id = player_1_id;
    }

    public int getPlayer_1_points() {
        return player_1_points;
    }

    public void setPlayer_1_points(int player_1_points) {
        this.player_1_points = player_1_points;
    }

    public String getPlayer_2_id() {
        return player_2_id;
    }

    public void setPlayer_2_id(String player_2_id) {
        this.player_2_id = player_2_id;
    }

    public int getPlayer_2_points() {
        return player_2_points;
    }

    public void setPlayer_2_points(int player_2_points) {
        this.player_2_points = player_2_points;
    }

    public String[] getVerified_answers() {
        return verified_answers;
    }

    public void setVerified_answers(String[] verified_answers) {
        this.verified_answers = verified_answers;
    }

    public int getRound() {
        return round;
    }

    public void setRound(int round) {
        this.round = round;
    }

    public int getMax_round() {
        return max_round;
    }

    public void setMax_round(int max_round) {
        this.max_round = max_round;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String get_id() {
        return _id;
    }

    public void set_id(String _id) {
        this._id = _id;
    }
}
