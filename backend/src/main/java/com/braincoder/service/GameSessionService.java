package com.braincoder.service;

import com.braincoder.dto.*;
import com.braincoder.entity.GameSession;
import com.braincoder.entity.SessionStatus;
import com.braincoder.entity.User;
import com.braincoder.exception.AppException;
import com.braincoder.repository.GameSessionRepository;
import com.braincoder.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GameSessionService {

    private final GameSessionRepository sessionRepository;
    private final UserRepository        userRepository;

    @Transactional
    public GameSessionStartResponse startSession(Long userId, GameSessionStartRequest req) {
        User user = findUser(userId);
        GameSession session = sessionRepository.save(GameSession.builder()
                .user(user)
                .brainRegion(req.getBrainRegion())
                .status(SessionStatus.IN_PROGRESS)
                .build());
        return new GameSessionStartResponse(session.getId(), session.getBrainRegion().name(), session.getStartedAt());
    }

    @Transactional
    public GameSessionResponse endSession(Long sessionId, Long userId, GameSessionEndRequest req) {
        GameSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "세션을 찾을 수 없습니다."));

        if (!session.getUser().getId().equals(userId))
            throw new AppException(HttpStatus.FORBIDDEN, "권한이 없습니다.");

        if (session.getStatus() == SessionStatus.COMPLETED)
            return toResponse(session);   // 중복 종료 요청은 기존 값 반환

        session.setScore(req.getScore());
        session.setAccuracy(req.getAccuracy());
        session.setReactionTimeMs(req.getReactionTimeMs());
        session.setDifficulty(req.getDifficulty());
        session.setPlayTimeSeconds(req.getPlayTimeSeconds());
        session.setStatus(SessionStatus.COMPLETED);
        session.setEndedAt(LocalDateTime.now());
        return toResponse(sessionRepository.save(session));
    }

    @Transactional(readOnly = true)
    public List<GameSessionResponse> getHistory(Long userId) {
        return sessionRepository.findByUserOrderByStartedAtDesc(findUser(userId))
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public StatsResponse getStats(Long userId) {
        List<GameSession> completed = sessionRepository
                .findByUserOrderByStartedAtDesc(findUser(userId))
                .stream()
                .filter(s -> s.getStatus() == SessionStatus.COMPLETED)
                .toList();

        int totalScore = completed.stream()
                .mapToInt(s -> s.getScore() != null ? s.getScore() : 0).sum();

        Map<String, StatsResponse.RegionStats> byRegion = completed.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getBrainRegion().name(),
                        Collectors.collectingAndThen(Collectors.toList(), list -> {
                            int score  = list.stream().mapToInt(s -> s.getScore() != null ? s.getScore() : 0).sum();
                            double avg = list.stream().filter(s -> s.getAccuracy() != null)
                                    .mapToDouble(GameSession::getAccuracy).average().orElse(0);
                            return new StatsResponse.RegionStats(list.size(), score, Math.round(avg * 10) / 10.0);
                        })
                ));

        return new StatsResponse(completed.size(), totalScore, byRegion);
    }

    // ─────────────────────────────────────────────────────────────

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
    }

    private GameSessionResponse toResponse(GameSession s) {
        return new GameSessionResponse(
                s.getId(), s.getBrainRegion().name(), s.getStatus().name(),
                s.getScore(), s.getAccuracy(), s.getReactionTimeMs(),
                s.getDifficulty(), s.getPlayTimeSeconds(),
                s.getStartedAt(), s.getEndedAt()
        );
    }
}
