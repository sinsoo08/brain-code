package com.braincoder.repository;

import com.braincoder.entity.GameSession;
import com.braincoder.entity.SessionStatus;
import com.braincoder.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameSessionRepository extends JpaRepository<GameSession, Long> {
    List<GameSession> findByUserOrderByStartedAtDesc(User user);
    List<GameSession> findByUserAndStatusOrderByStartedAtDesc(User user, SessionStatus status);
}
