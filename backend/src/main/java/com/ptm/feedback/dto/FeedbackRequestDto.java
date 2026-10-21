package com.ptm.feedback.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class FeedbackRequestDto {

    @NotBlank(message = "Student name is required")
    @Size(max = 150, message = "Student name cannot exceed 150 characters")
    private String studentName;

    @NotBlank(message = "Class and section is required")
    @Pattern(
        regexp = "^(?:[1-9]|10)/[A-D]$",
        message = "Class and section must be between 1/A and 10/D"
    )
    private String classSection;

    @Size(max = 150, message = "Parent name cannot exceed 150 characters")
    private String parentName;

    @Pattern(
        regexp = "^$|^[0-9+\\-\\s]{10,15}$",
        message = "Mobile number must be a valid 10 to 15 digit number if provided"
    )
    private String mobileNumber;

    @NotBlank(message = "Feedback comment is required")
    private String feedbackComment;

    private boolean needsAttention;

    private String attentionComment;

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getClassSection() {
        return classSection;
    }

    public void setClassSection(String classSection) {
        this.classSection = classSection;
    }

    public String getParentName() {
        return parentName;
    }

    public void setParentName(String parentName) {
        this.parentName = parentName;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public String getFeedbackComment() {
        return feedbackComment;
    }

    public void setFeedbackComment(String feedbackComment) {
        this.feedbackComment = feedbackComment;
    }

    public boolean isNeedsAttention() {
        return needsAttention;
    }

    public void setNeedsAttention(boolean needsAttention) {
        this.needsAttention = needsAttention;
    }

    public String getAttentionComment() {
        return attentionComment;
    }

    public void setAttentionComment(String attentionComment) {
        this.attentionComment = attentionComment;
    }
}
