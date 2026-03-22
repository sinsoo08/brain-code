package com.braincoder.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Map;

@Getter
@AllArgsConstructor
public class StatsResponse {
    private final int totalGames;
    private final int totalScore;
    private final Map<String, RegionStats> byRegion;

    @Getter
    @AllArgsConstructor
    public static class RegionStats {
        private final int games;
        private final int totalScore;
        private final double avgAccuracy;
    }
}
