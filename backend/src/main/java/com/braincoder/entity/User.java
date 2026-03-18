package com.braincoder.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String password;
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuthProvider provider;

    private String providerId;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public User() {}

    private User(Builder builder) {
        this.email = builder.email;
        this.password = builder.password;
        this.nickname = builder.nickname;
        this.provider = builder.provider;
        this.providerId = builder.providerId;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String email;
        private String password;
        private String nickname;
        private AuthProvider provider;
        private String providerId;

        public Builder email(String v) { this.email = v; return this; }
        public Builder password(String v) { this.password = v; return this; }
        public Builder nickname(String v) { this.nickname = v; return this; }
        public Builder provider(AuthProvider v) { this.provider = v; return this; }
        public Builder providerId(String v) { this.providerId = v; return this; }
        public User build() { return new User(this); }
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getNickname() { return nickname; }
    public AuthProvider getProvider() { return provider; }
    public String getProviderId() { return providerId; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setNickname(String nickname) { this.nickname = nickname; }
    public void setProvider(AuthProvider provider) { this.provider = provider; }
    public void setProviderId(String providerId) { this.providerId = providerId; }
}
