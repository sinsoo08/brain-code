package com.braincoder.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** AuthService 내부 반환값 - accessToken과 refreshToken 모두 포함 */
@Getter
@AllArgsConstructor
public class AuthResult {
    private final String accessToken;
    private final String refreshToken;
    private final String email;
    private final String nickname;
}
