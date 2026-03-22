package com.braincoder.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Redis 기반 토큰 관리 서비스
 * - Refresh Token 저장/조회/삭제
 * - Access Token 블랙리스트 (로그아웃 처리)
 * Redis 연결 실패 시 경고 로그만 남기고 진행 (Access Token은 정상 동작)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TokenService {

    private final StringRedisTemplate redisTemplate;

    private static final String REFRESH_PREFIX   = "refresh:";
    private static final String BLACKLIST_PREFIX = "blacklist:";

    // ─── Refresh Token ────────────────────────────────────────────

    public void saveRefreshToken(Long userId, String refreshToken, long expirationMs) {
        try {
            redisTemplate.opsForValue().set(
                    REFRESH_PREFIX + refreshToken,
                    userId.toString(),
                    Duration.ofMillis(expirationMs)
            );
        } catch (Exception e) {
            log.warn("[TokenService] Redis 연결 실패 - Refresh Token 저장 불가 (userId={}): {}", userId, e.getMessage());
        }
    }

    public Long getUserIdFromRefreshToken(String refreshToken) {
        try {
            String value = redisTemplate.opsForValue().get(REFRESH_PREFIX + refreshToken);
            if (value == null) return null;
            return Long.parseLong(value);
        } catch (Exception e) {
            log.warn("[TokenService] Redis 연결 실패 - Refresh Token 조회 불가: {}", e.getMessage());
            return null;
        }
    }

    public void deleteRefreshToken(String refreshToken) {
        try {
            redisTemplate.delete(REFRESH_PREFIX + refreshToken);
        } catch (Exception e) {
            log.warn("[TokenService] Redis 연결 실패 - Refresh Token 삭제 불가: {}", e.getMessage());
        }
    }

    // ─── Access Token 블랙리스트 ──────────────────────────────────

    public void blacklistAccessToken(String accessToken, long remainingMs) {
        if (remainingMs <= 0) return;
        try {
            redisTemplate.opsForValue().set(
                    BLACKLIST_PREFIX + accessToken,
                    "1",
                    Duration.ofMillis(remainingMs)
            );
        } catch (Exception e) {
            log.warn("[TokenService] Redis 연결 실패 - 블랙리스트 등록 불가: {}", e.getMessage());
        }
    }

    public boolean isBlacklisted(String accessToken) {
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLIST_PREFIX + accessToken));
        } catch (Exception e) {
            log.warn("[TokenService] Redis 연결 실패 - 블랙리스트 확인 불가: {}", e.getMessage());
            return false;
        }
    }
}
