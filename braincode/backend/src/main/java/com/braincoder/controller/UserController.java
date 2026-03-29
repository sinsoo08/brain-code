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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    @Transactional(readOnly = true)
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(toResponse(findUser(principal.getId())));
    }

    @PutMapping("/me")
    @Transactional
    public ResponseEntity<UserResponse> updateMe(@RequestBody @Valid UpdateProfileRequest request,
                                                  @AuthenticationPrincipal UserPrincipal principal) {
        User user = findUser(principal.getId());
        user.setNickname(request.getNickname());
        userRepository.save(user);
        return ResponseEntity.ok(toResponse(user));
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(), user.getEmail(), user.getNickname(),
                user.getKidName(), user.getKidBirthYear(), user.getKidBirthDate(),
                user.getAvatar()
        );
    }
}
