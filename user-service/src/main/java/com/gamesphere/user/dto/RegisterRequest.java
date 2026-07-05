package com.gamesphere.user.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String avatarUrl;
    private String bio;
}
