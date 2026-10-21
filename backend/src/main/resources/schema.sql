CREATE TABLE IF NOT EXISTS ptm_feedback (
    id BIGSERIAL PRIMARY KEY,
    student_name VARCHAR(150) NOT NULL,
    class_section VARCHAR(10) NOT NULL,
    parent_name VARCHAR(150),
    mobile_number VARCHAR(20),
    feedback_comment TEXT NOT NULL,
    needs_attention BOOLEAN NOT NULL DEFAULT FALSE,
    attention_comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ptm_feedback_class_section ON ptm_feedback(class_section);
CREATE INDEX IF NOT EXISTS idx_ptm_feedback_needs_attention ON ptm_feedback(needs_attention);
