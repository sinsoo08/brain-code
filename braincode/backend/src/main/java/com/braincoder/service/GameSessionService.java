package com.braincoder.service;

import com.braincoder.dto.*;
import com.braincoder.entity.BrainRegion;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
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
            return toResponse(session);

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
        User user = findUser(userId);
        List<GameSession> completed = sessionRepository
                .findByUserAndStatusOrderByStartedAtDesc(user, SessionStatus.COMPLETED);

        // last7: 6 days ago 00:00 ~ tomorrow 00:00 (today inclusive)
        LocalDate today = LocalDate.now();
        LocalDateTime last7Start = today.minusDays(6).atStartOfDay();
        LocalDateTime last7End   = today.plusDays(1).atStartOfDay();
        LocalDateTime prev7Start = today.minusDays(13).atStartOfDay();
        LocalDateTime prev7End   = last7Start;
        LocalDateTime todayStart = today.atStartOfDay();

        int totalScore = completed.stream()
                .mapToInt(s -> s.getScore() != null ? s.getScore() : 0).sum();

        Map<String, StatsResponse.RegionStats> byRegion = Arrays.stream(BrainRegion.values())
                .collect(Collectors.toMap(
                        BrainRegion::name,
                        region -> {
                            List<GameSession> rs = completed.stream()
                                    .filter(s -> s.getBrainRegion() == region)
                                    .collect(Collectors.toList());
                            return buildRegionStats(rs, todayStart, last7Start, last7End, prev7Start, prev7End);
                        }
                ));

        String bestRegion = byRegion.entrySet().stream()
                .filter(e -> e.getValue().getGames() > 0)
                .max(Comparator.comparingDouble(e -> e.getValue().getAvgAccuracy()))
                .map(Map.Entry::getKey).orElse(null);

        String worstRegion = byRegion.entrySet().stream()
                .filter(e -> e.getValue().getGames() > 0)
                .min(Comparator.comparingDouble(e -> e.getValue().getAvgAccuracy()))
                .map(Map.Entry::getKey).orElse(null);

        return new StatsResponse(completed.size(), totalScore, bestRegion, worstRegion, byRegion);
    }

    // ─────────────────────────────────────────────────────────────

    private StatsResponse.RegionStats buildRegionStats(
            List<GameSession> sessions,
            LocalDateTime todayStart,
            LocalDateTime last7Start, LocalDateTime last7End,
            LocalDateTime prev7Start, LocalDateTime prev7End) {

        int games = sessions.size();
        int clearedGames = (int) sessions.stream()
                .filter(s -> s.getAccuracy() != null && s.getAccuracy() >= 100.0)
                .count();
        int todayGames = (int) sessions.stream()
                .filter(s -> !s.getStartedAt().isBefore(todayStart))
                .count();
        int totalScore = sessions.stream()
                .mapToInt(s -> s.getScore() != null ? s.getScore() : 0).sum();
        double avgAccuracy = sessions.stream()
                .filter(s -> s.getAccuracy() != null)
                .mapToDouble(GameSession::getAccuracy).average().orElse(0);
        int streak = calculateStreak(sessions);
        List<Integer> last7 = getDailyScores(sessions, last7Start, last7End);
        List<Integer> prev7 = getDailyScores(sessions, prev7Start, prev7End);

        return new StatsResponse.RegionStats(
                games, clearedGames, todayGames, totalScore,
                Math.round(avgAccuracy * 10) / 10.0,
                streak, last7, prev7);
    }

    private int calculateStreak(List<GameSession> sessions) {
        if (sessions.isEmpty()) return 0;
        Set<LocalDate> playedDates = sessions.stream()
                .map(s -> s.getStartedAt().toLocalDate())
                .collect(Collectors.toSet());
        LocalDate check = LocalDate.now();
        int streak = 0;
        while (playedDates.contains(check)) {
            streak++;
            check = check.minusDays(1);
        }
        if (streak == 0) {
            check = LocalDate.now().minusDays(1);
            while (playedDates.contains(check)) {
                streak++;
                check = check.minusDays(1);
            }
        }
        return streak;
    }

    // Returns 7 values: index 0 = from.toLocalDate(), index 6 = 6 days after
    private List<Integer> getDailyScores(List<GameSession> sessions, LocalDateTime from, LocalDateTime to) {
        Map<LocalDate, Integer> scoreByDate = sessions.stream()
                .filter(s -> !s.getStartedAt().isBefore(from) && s.getStartedAt().isBefore(to))
                .collect(Collectors.groupingBy(
                        s -> s.getStartedAt().toLocalDate(),
                        Collectors.summingInt(s -> s.getScore() != null ? s.getScore() : 0)
                ));
        List<Integer> result = new ArrayList<>();
        LocalDate start = from.toLocalDate();
        for (int i = 0; i < 7; i++) {
            result.add(scoreByDate.getOrDefault(start.plusDays(i), 0));
        }
        return result;
    }

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
