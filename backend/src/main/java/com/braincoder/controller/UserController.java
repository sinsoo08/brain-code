package com.braincoder.controller;

import com.braincoder.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "인증이 필요합니다."));
        }
        Map<String, Object> result = new HashMap<>();
        result.put("id", userPrincipal.getId());
        result.put("email", userPrincipal.getEmail());
        return ResponseEntity.ok(result);
    }
}
