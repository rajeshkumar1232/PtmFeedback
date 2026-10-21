package com.ptm.feedback.repository;

import com.ptm.feedback.entity.PtmFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PtmFeedbackRepository extends JpaRepository<PtmFeedback, Long> {

    @Query("""
        SELECT f FROM PtmFeedback f
        WHERE (:classSection IS NULL OR :classSection = '' OR f.classSection = :classSection)
          AND (:needsAttention IS NULL OR f.needsAttention = :needsAttention)
        ORDER BY f.createdAt DESC
    """)
    List<PtmFeedback> findByFilters(
        @Param("classSection") String classSection,
        @Param("needsAttention") Boolean needsAttention
    );
}
