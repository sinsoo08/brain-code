package com.braincoder.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GameSessionEndRequest {
    private Integer score;
    private Double accuracy;        // 정확도 (%)
    private Integer reactionTimeMs; // 반응속도 (ms), 소뇌 게임만 해당
    private Integer difficulty;     // 난이도 (1~5)
    private Integer playTimeSeconds;
}
