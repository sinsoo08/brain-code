package com.braincoder.security;

import com.braincoder.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;
    private final TokenService     tokenService;

    @Value("${app.oauth2.redirect-uri}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        try {
            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            log.info("[OAuth2 Success] userId={}, email={}", principal.getId(), principal.getEmail());

            String email = principal.getEmail() != null ? principal.getEmail() : "";
            String accessToken  = tokenProvider.generateAccessToken(principal.getId(), email);
            String refreshToken = tokenProvider.generateRefreshToken(principal.getId());

            tokenService.saveRefreshToken(principal.getId(), refreshToken, tokenProvider.getRefreshExpiration());

            // Refresh token을 HttpOnly 쿠키로 설정
            ResponseCookie cookie = ResponseCookie.from("refresh_token", refreshToken)
                    .httpOnly(true)
                    .secure(false)
                    .path("/api/auth")
                    .maxAge(Duration.ofDays(14))
                    .sameSite("Lax")
                    .build();
            response.setHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            String targetUrl = redirectUri + "?token=" + accessToken;
            log.info("[OAuth2 Success] Redirecting to: {}", targetUrl);
            response.sendRedirect(targetUrl);

        } catch (Exception e) {
            log.error("[OAuth2 Success] 핸들러 오류: {}", e.getMessage(), e);
            response.sendRedirect("http://localhost:5173/login?error=oauth2_error");
        }
    }
}
