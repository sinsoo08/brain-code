package com.braincoder.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserResponse {
    private final Long id;
    private final String email;
    private final String nickname;
    private final String kidName;
    private final String kidBirthYear;
    private final String kidBirthDate;
    private final String avatar;
}
