package com.braincoder.service;

import com.braincoder.entity.AuthProvider;
import com.braincoder.entity.User;
import com.braincoder.oauth2.OAuth2UserInfo;
import com.braincoder.oauth2.OAuth2UserInfoFactory;
import com.braincoder.repository.UserRepository;
import com.braincoder.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

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

            Optional<User> userOptional = userRepository.findByProviderAndProviderId(
                    provider, userInfo.getId());

            User user;
            if (userOptional.isPresent()) {
                user = userOptional.get();
                if (userInfo.getName() != null) {
                    user.setNickname(userInfo.getName());
                    user = userRepository.save(user);
                }
            } else {
                String email = userInfo.getEmail();
                if (email != null) {
                    Optional<User> existingUser = userRepository.findByEmail(email);
                    if (existingUser.isPresent()) {
                        user = existingUser.get();
                        user.setProvider(provider);
                        user.setProviderId(userInfo.getId());
                        user = userRepository.save(user);
                    } else {
                        user = createNewUser(provider, userInfo);
                    }
                } else {
                    user = createNewUser(provider, userInfo);
                }
            }

            return UserPrincipal.create(user, oAuth2User.getAttributes());

        } catch (OAuth2AuthenticationException e) {
            throw e;
        } catch (Exception e) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("processing_error"), "처리 중 오류: " + e.getMessage(), e);
        }
    }

    private User createNewUser(AuthProvider provider, OAuth2UserInfo userInfo) {
        User user = User.builder()
                .email(userInfo.getEmail())
                .nickname(userInfo.getName())
                .provider(provider)
                .providerId(userInfo.getId())
                .build();
        return userRepository.save(user);
    }
}
