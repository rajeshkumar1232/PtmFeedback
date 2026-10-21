package com.ptm.feedback.service;

import com.ptm.feedback.dto.FeedbackRequestDto;
import com.ptm.feedback.entity.PtmFeedback;
import com.ptm.feedback.repository.PtmFeedbackRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class FeedbackServiceTest {

    private PtmFeedbackRepository repository;
    private FeedbackService feedbackService;

    @BeforeEach
    void setUp() {
        repository = mock(PtmFeedbackRepository.class);
        feedbackService = new FeedbackService(repository);
    }

    @Test
    void standardClassesShouldInclude1ATo10D() {
        List<String> classes = feedbackService.getStandardClasses();
        assertEquals(40, classes.size());
        assertEquals("1/A", classes.get(0));
        assertTrue(classes.contains("4/A"));
        assertEquals("10/D", classes.get(classes.size() - 1));
    }

    @Test
    void submitFeedbackRequiresAttentionCommentWhenFlagged() {
        FeedbackRequestDto dto = new FeedbackRequestDto();
        dto.setStudentName("Aarav Sharma");
        dto.setClassSection("4/A");
        dto.setFeedbackComment("Great PTM session");
        dto.setNeedsAttention(true);
        dto.setAttentionComment("   ");

        assertThrows(ResponseStatusException.class, () -> feedbackService.submitFeedback(dto));
    }

    @Test
    void submitFeedbackClearsAttentionCommentWhenNotFlagged() {
        FeedbackRequestDto dto = new FeedbackRequestDto();
        dto.setStudentName("Aarav Sharma");
        dto.setClassSection("4/A");
        dto.setFeedbackComment("Good session");
        dto.setNeedsAttention(false);
        dto.setAttentionComment("Should be ignored");

        when(repository.save(any(PtmFeedback.class))).thenAnswer(inv -> inv.getArgument(0));

        PtmFeedback saved = feedbackService.submitFeedback(dto);
        assertNotNull(saved);
        assertEquals("Aarav Sharma", saved.getStudentName());
        assertEquals("4/A", saved.getClassSection());
        assertNull(saved.getAttentionComment());
    }
}
