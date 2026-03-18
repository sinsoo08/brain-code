package com.braincoder.service;

import com.braincoder.dto.AuthResponse;
import com.braincoder.dto.LoginRequest;
import com.braincoder.dto.SignupRequest;
import com.braincoder.entity.AuthProvider;
import com.braincoder.entity.User;
import com.braincoder.repository.UserRepository;
import com.braincoder.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("이미 사용 중인 이메일입니다.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .provider(AuthProvider.LOCAL)
                .build();

        user = userRepository.save(user);

        String token = tokenProvider.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getNickname());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        if (user.getPassword() == null) {
            throw new RuntimeException("소셜 로그인으로 가입된 계정입니다. 소셜 로그인을 이용해주세요.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("잘못된 비밀번호입니다.");
        }

        String token = tokenProvider.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getNickname());
    }
}
