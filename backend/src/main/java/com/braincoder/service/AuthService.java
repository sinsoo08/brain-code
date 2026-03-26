package com.braincoder.service;

import com.braincoder.dto.AuthResult;
import com.braincoder.dto.LoginRequest;
import com.braincoder.dto.SignupRequest;
import com.braincoder.entity.AuthProvider;
import com.braincoder.entity.User;
import com.braincoder.exception.AppException;
import com.braincoder.repository.UserRepository;
import com.braincoder.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository   userRepository;
    private final PasswordEncoder  passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final TokenService     tokenService;

    public AuthResult signup(SignupRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new AppException(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다.");

        String nickname = StringUtils.hasText(req.getNickname())
                ? req.getNickname()
                : req.getEmail().split("@")[0];

        User user = userRepository.save(User.builder()
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .nickname(nickname)
                .provider(AuthProvider.LOCAL)
                .build());

        return issueTokens(user);
    }

    public AuthResult login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다."));

        if (user.getPassword() == null)
            throw new AppException(HttpStatus.BAD_REQUEST, "소셜 로그인으로 가입된 계정입니다.");

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword()))
            throw new AppException(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다.");

        return issueTokens(user);
    }

    public AuthResult refresh(String refreshToken) {
        Long userId = tokenService.getUserIdFromRefreshToken(refreshToken);
        if (userId == null)
            throw new AppException(HttpStatus.UNAUTHORIZED, "만료되었거나 유효하지 않은 Refresh token입니다.");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));

        // Refresh Token Rotation
        tokenService.deleteRefreshToken(refreshToken);
        String newRefresh = tokenProvider.generateRefreshToken(userId);
        tokenService.saveRefreshToken(userId, newRefresh, tokenProvider.getRefreshExpiration());

        return new AuthResult(
                tokenProvider.generateAccessToken(userId, user.getEmail()),
                newRefresh,
                user.getEmail(),
                user.getNickname()
        );
    }

    public void logout(String bearerToken, String refreshToken) {
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            String accessToken = bearerToken.substring(7);
            if (tokenProvider.validateToken(accessToken))
                tokenService.blacklistAccessToken(accessToken, tokenProvider.getRemainingMs(accessToken));
        }
        if (StringUtils.hasText(refreshToken))
            tokenService.deleteRefreshToken(refreshToken);
    }

    // ─────────────────────────────────────────────────────────────

    private AuthResult issueTokens(User user) {
        String access  = tokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String refresh = tokenProvider.generateRefreshToken(user.getId());
        tokenService.saveRefreshToken(user.getId(), refresh, tokenProvider.getRefreshExpiration());
        return new AuthResult(access, refresh, user.getEmail(), user.getNickname());
    }
}
