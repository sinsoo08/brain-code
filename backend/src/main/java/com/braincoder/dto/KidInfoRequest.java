package com.braincoder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class KidInfoRequest {

    @NotBlank(message = "아이의 이름을 입력해주세요.")
    private String name;

    @NotBlank(message = "태어난 년도를 입력해주세요.")
    @Pattern(regexp = "^\\d{4}$", message = "년도는 4자리 숫자로 입력해주세요.")
    private String birthYear;

    @NotBlank(message = "태어난 월/일을 입력해주세요.")
    @Pattern(regexp = "^\\d{4}$", message = "월/일은 4자리 숫자로 입력해주세요. 예: 0520")
    private String birthDate;

    private String avatar;
}
