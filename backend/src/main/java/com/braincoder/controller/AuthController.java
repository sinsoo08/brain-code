package com.braincoder.controller;

import com.braincoder.dto.AuthResponse;
import com.braincoder.dto.AuthResult;
import com.braincoder.dto.LoginRequest;
import com.braincoder.dto.SignupRequest;
import com.braincoder.exception.AppException;
import com.braincoder.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody @Valid SignupRequest req,
                                               HttpServletResponse res) {
        AuthResult result = authService.signup(req);
        setRefreshCookie(res, result.getRefreshToken());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(result));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid LoginRequest req,
                                              HttpServletResponse res) {
        AuthResult result = authService.login(req);
        setRefreshCookie(res, result.getRefreshToken());
        return ResponseEntity.ok(toResponse(result));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest req, HttpServletResponse res) {
        String refreshToken = extractRefreshCookie(req);
        if (refreshToken == null)
            throw new AppException(HttpStatus.UNAUTHORIZED, "Refresh token이 없습니다.");

        AuthResult result = authService.refresh(refreshToken);
        setRefreshCookie(res, result.getRefreshToken());
        return ResponseEntity.ok(toResponse(result));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest req, HttpServletResponse res) {
        authService.logout(req.getHeader("Authorization"), extractRefreshCookie(req));
        deleteRefreshCookie(res);
        return ResponseEntity.noContent().build();
    }

    // ─── 쿠키 & 응답 변환 ─────────────────────────────────────────

    private static AuthResponse toResponse(AuthResult r) {
        return new AuthResponse(r.getAccessToken(), r.getEmail(), r.getNickname());
    }

    private static void setRefreshCookie(HttpServletResponse res, String token) {
        res.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from("refresh_token", token)
                .httpOnly(true).secure(false).path("/api/auth")
                .maxAge(Duration.ofDays(14)).sameSite("Lax")
                .build().toString());
    }

    private static void deleteRefreshCookie(HttpServletResponse res) {
        res.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from("refresh_token", "")
                .httpOnly(true).path("/api/auth").maxAge(Duration.ZERO)
                .build().toString());
    }

    private static String extractRefreshCookie(HttpServletRequest req) {
        if (req.getCookies() == null) return null;
        for (Cookie c : req.getCookies())
            if ("refresh_token".equals(c.getName())) return c.getValue();
        return null;
    }
}
