package com.braincoder.controller;

import com.braincoder.dto.UpdateProfileRequest;
import com.braincoder.dto.UserResponse;
import com.braincoder.entity.User;
import com.braincoder.exception.AppException;
import com.braincoder.repository.UserRepository;
import com.braincoder.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal UserPrincipal principal) {
        User user = findUser(principal.getId());
        return ResponseEntity.ok(new UserResponse(user.getId(), user.getEmail(), user.getNickname()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMe(@RequestBody @Valid UpdateProfileRequest request,
                                                  @AuthenticationPrincipal UserPrincipal principal) {
        User user = findUser(principal.getId());
        user.setNickname(request.getNickname());
        userRepository.save(user);
        return ResponseEntity.ok(new UserResponse(user.getId(), user.getEmail(), user.getNickname()));
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
    }
}
