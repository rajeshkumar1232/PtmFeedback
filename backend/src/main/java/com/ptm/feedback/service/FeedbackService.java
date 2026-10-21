package com.ptm.feedback.service;

import com.ptm.feedback.dto.FeedbackRequestDto;
import com.ptm.feedback.entity.PtmFeedback;
import com.ptm.feedback.repository.PtmFeedbackRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class FeedbackService {

    private static final List<String> STANDARD_CLASSES;

    static {
        List<String> list = new ArrayList<>();
        String[] sections = {"A", "B", "C", "D"};
        for (int grade = 1; grade <= 10; grade++) {
            for (String section : sections) {
                list.add(grade + "/" + section);
            }
        }
        STANDARD_CLASSES = Collections.unmodifiableList(list);
    }

    private final PtmFeedbackRepository repository;

    public FeedbackService(PtmFeedbackRepository repository) {
        this.repository = repository;
    }

    public List<String> getStandardClasses() {
        return STANDARD_CLASSES;
    }

    public PtmFeedback submitFeedback(FeedbackRequestDto dto) {
        if (dto.isNeedsAttention()) {
            if (dto.getAttentionComment() == null || dto.getAttentionComment().trim().isEmpty()) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Attention comment is required when Principal or Admin attention is checked"
                );
            }
        }

        PtmFeedback entity = new PtmFeedback();
        entity.setStudentName(dto.getStudentName().trim());
        entity.setClassSection(dto.getClassSection().trim());
        entity.setParentName(trimOrNull(dto.getParentName()));
        entity.setMobileNumber(trimOrNull(dto.getMobileNumber()));
        entity.setFeedbackComment(dto.getFeedbackComment().trim());
        entity.setNeedsAttention(dto.isNeedsAttention());
        entity.setAttentionComment(dto.isNeedsAttention() ? trimOrNull(dto.getAttentionComment()) : null);

        return repository.save(entity);
    }

    public List<PtmFeedback> getFeedback(String classSection, Boolean needsAttention) {
        String normalizedClass = (classSection != null && !classSection.isBlank())
            ? classSection.trim()
            : null;
        return repository.findByFilters(normalizedClass, needsAttention);
    }

    private String trimOrNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
