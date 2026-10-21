package com.ptm.feedback.controller;

import com.ptm.feedback.dto.FeedbackRequestDto;
import com.ptm.feedback.entity.PtmFeedback;
import com.ptm.feedback.service.AuthService;
import com.ptm.feedback.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final AuthService authService;

    public FeedbackController(FeedbackService feedbackService, AuthService authService) {
        this.feedbackService = feedbackService;
        this.authService = authService;
    }

    @GetMapping("/classes")
    public List<String> getClasses() {
        return feedbackService.getStandardClasses();
    }

    @PostMapping("/feedback")
    public ResponseEntity<PtmFeedback> submitFeedback(@Valid @RequestBody FeedbackRequestDto request) {
        PtmFeedback saved = feedbackService.submitFeedback(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/feedback")
    public ResponseEntity<?> getFeedback(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @RequestParam(value = "classSection", required = false) String classSection,
        @RequestParam(value = "needsAttention", required = false) Boolean needsAttention
    ) {
        var sessionOpt = authService.validateToken(authHeader);
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Faculty login required to view PTM feedback"));
        }

        List<PtmFeedback> items = feedbackService.getFeedback(classSection, needsAttention);
        return ResponseEntity.ok(items);
    }
}
