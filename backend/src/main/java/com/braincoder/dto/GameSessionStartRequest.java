package com.braincoder.dto;

import com.braincoder.entity.BrainRegion;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GameSessionStartRequest {

    @NotNull(message = "뇌 영역을 선택해주세요.")
    private BrainRegion brainRegion;
}
