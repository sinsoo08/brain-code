package com.braincoder.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class GameSessionStartResponse {
    private final Long sessionId;
    private final String brainRegion;
    private final LocalDateTime startedAt;
}
