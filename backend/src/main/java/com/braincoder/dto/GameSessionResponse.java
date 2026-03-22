package com.braincoder.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class GameSessionResponse {
    private final Long id;
    private final String brainRegion;
    private final String status;
    private final Integer score;
    private final Double accuracy;
    private final Integer reactionTimeMs;
    private final Integer difficulty;
    private final Integer playTimeSeconds;
    private final LocalDateTime startedAt;
    private final LocalDateTime endedAt;
}
