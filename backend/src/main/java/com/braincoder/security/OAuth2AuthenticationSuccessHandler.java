package com.braincoder.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler.class);

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Value("${app.oauth2.redirect-uri}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            log.info("[OAuth2 Success] userId={}, email={}", userPrincipal.getId(), userPrincipal.getEmail());
            String token = tokenProvider.generateToken(
                    userPrincipal.getId(),
                    userPrincipal.getEmail() != null ? userPrincipal.getEmail() : ""
            );
            String targetUrl = redirectUri + "?token=" + token;
            log.info("[OAuth2 Success] Redirecting to: {}", targetUrl);
            response.sendRedirect(targetUrl);
        } catch (Exception e) {
            log.error("[OAuth2 Success] 핸들러 오류: {}", e.getMessage(), e);
            response.sendRedirect("http://localhost:5173/login?error=" + e.getMessage());
        }
    }
}
