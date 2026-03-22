package com.braincoder.security;

import com.braincoder.repository.UserRepository;
import com.braincoder.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final UserRepository   userRepository;
    private final TokenService     tokenService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String jwt = extractToken(request);

        if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
            // 로그아웃된 토큰(블랙리스트) 차단
            if (tokenService.isBlacklisted(jwt)) {
                log.debug("[JWT Filter] Blacklisted token rejected: {}", request.getRequestURI());
                filterChain.doFilter(request, response);
                return;
            }

            Long userId = tokenProvider.getUserIdFromToken(jwt);
            userRepository.findById(userId).ifPresent(user -> {
                UserPrincipal principal = UserPrincipal.create(user);
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
                log.debug("[JWT Filter] Authenticated userId={} path={}", userId, request.getRequestURI());
            });
        }

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}
