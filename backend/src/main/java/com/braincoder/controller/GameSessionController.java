package com.braincoder.controller;

import com.braincoder.dto.GameSessionEndRequest;
import com.braincoder.dto.GameSessionResponse;
import com.braincoder.dto.GameSessionStartRequest;
import com.braincoder.dto.GameSessionStartResponse;
import com.braincoder.dto.StatsResponse;
import com.braincoder.security.UserPrincipal;
import com.braincoder.service.GameSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class GameSessionController {

    private final GameSessionService sessionService;

    /** 게임 세션 시작 */
    @PostMapping("/start")
    public ResponseEntity<GameSessionStartResponse> startSession(
            @RequestBody @Valid GameSessionStartRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sessionService.startSession(principal.getId(), request));
    }

    /** 게임 결과 저장 (완료 또는 중간 이탈) */
    @PostMapping("/{id}/end")
    public ResponseEntity<GameSessionResponse> endSession(
            @PathVariable Long id,
            @RequestBody GameSessionEndRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        return ResponseEntity.ok(sessionService.endSession(id, principal.getId(), request));
    }

    /** 내 플레이 기록 조회 */
    @GetMapping("/history")
    public ResponseEntity<List<GameSessionResponse>> getHistory(
            @AuthenticationPrincipal UserPrincipal principal) {

        return ResponseEntity.ok(sessionService.getHistory(principal.getId()));
    }

    /** 누적 통계 조회 */
    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> getStats(
            @AuthenticationPrincipal UserPrincipal principal) {

        return ResponseEntity.ok(sessionService.getStats(principal.getId()));
    }
}
