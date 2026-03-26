package com.braincoder.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GameSessionEndRequest {

    @Min(value = 0, message = "점수는 0 이상이어야 합니다.")
    private Integer score;

    @DecimalMin(value = "0.0", message = "정확도는 0 이상이어야 합니다.")
    @DecimalMax(value = "100.0", message = "정확도는 100 이하이어야 합니다.")
    private Double accuracy;

    @Min(value = 0, message = "반응속도는 0 이상이어야 합니다.")
    private Integer reactionTimeMs;

    @Min(value = 1, message = "난이도는 1 이상이어야 합니다.")
    private Integer difficulty;

    @Min(value = 0, message = "플레이 시간은 0 이상이어야 합니다.")
    private Integer playTimeSeconds;
}
