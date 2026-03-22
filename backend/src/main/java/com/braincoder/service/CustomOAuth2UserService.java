package com.braincoder.service;

import com.braincoder.entity.AuthProvider;
import com.braincoder.entity.User;
import com.braincoder.oauth2.OAuth2UserInfo;
import com.braincoder.oauth2.OAuth2UserInfoFactory;
import com.braincoder.repository.UserRepository;
import com.braincoder.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User;
        try {
            oAuth2User = super.loadUser(userRequest);
        } catch (Exception e) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("user_info_error"), "사용자 정보를 가져오지 못했습니다: " + e.getMessage(), e);
        }

        try {
            String registrationId = userRequest.getClientRegistration().getRegistrationId();
            OAuth2UserInfo userInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(
                    registrationId, oAuth2User.getAttributes());
            AuthProvider provider = AuthProvider.valueOf(registrationId.toUpperCase());

            User user = userRepository.findByProviderAndProviderId(provider, userInfo.getId())
                    .map(existing -> {
                        if (userInfo.getName() != null) existing.setNickname(userInfo.getName());
                        return userRepository.save(existing);
                    })
                    .orElseGet(() -> resolveOrCreateUser(provider, userInfo));

            return UserPrincipal.create(user, oAuth2User.getAttributes());

        } catch (OAuth2AuthenticationException e) {
            throw e;
        } catch (Exception e) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("processing_error"), "처리 중 오류: " + e.getMessage(), e);
        }
    }

    private User resolveOrCreateUser(AuthProvider provider, OAuth2UserInfo userInfo) {
        if (userInfo.getEmail() != null) {
            return userRepository.findByEmail(userInfo.getEmail())
                    .map(existing -> {
                        existing.setProvider(provider);
                        existing.setProviderId(userInfo.getId());
                        return userRepository.save(existing);
                    })
                    .orElseGet(() -> createNewUser(provider, userInfo));
        }
        return createNewUser(provider, userInfo);
    }

    private User createNewUser(AuthProvider provider, OAuth2UserInfo userInfo) {
        return userRepository.save(User.builder()
                .email(userInfo.getEmail())
                .nickname(userInfo.getName())
                .provider(provider)
                .providerId(userInfo.getId())
                .build());
    }
}
