package com.braincoder.controller;

import com.braincoder.dto.KidInfoRequest;
import com.braincoder.entity.User;
import com.braincoder.exception.AppException;
import com.braincoder.repository.UserRepository;
import com.braincoder.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/kids")
@RequiredArgsConstructor
public class KidController {

    private final UserRepository userRepository;

    @PostMapping
    @Transactional
    public ResponseEntity<Void> saveKidInfo(@RequestBody @Valid KidInfoRequest req,
                                            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        user.setKidName(req.getName());
        user.setKidBirthYear(req.getBirthYear());
        user.setKidBirthDate(req.getBirthDate());
        user.setAvatar(req.getAvatar());

        return ResponseEntity.ok().build();
    }
}
