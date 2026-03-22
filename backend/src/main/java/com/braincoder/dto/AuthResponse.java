package com.braincoder.dto;

import lombok.Getter;

/** 로그인/회원가입/토큰갱신 응답 - 프론트엔드 호환성을 위해 'token' 필드명 유지 */
@Getter
public class AuthResponse {
    private final String token;        // accessToken
    private final String tokenType = "Bearer";
    private final String email;
    private final String nickname;

    public AuthResponse(String token, String email, String nickname) {
        this.token = token;
        this.email = email;
        this.nickname = nickname;
    }
}
