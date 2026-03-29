package com.braincoder.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
@AllArgsConstructor
public class StatsResponse {
    private final int totalGames;
    private final int totalScore;
    private final String bestRegion;
    private final String worstRegion;
    private final Map<String, RegionStats> byRegion;

    @Getter
    @AllArgsConstructor
    public static class RegionStats {
        private final int games;
        private final int clearedGames;
        private final int todayGames;
        private final int totalScore;
        private final double avgAccuracy;
        private final int streak;
        private final List<Integer> last7DaysScores;
        private final List<Integer> prev7DaysScores;
    }
}
