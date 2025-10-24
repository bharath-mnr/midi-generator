//midigenerator/repository/MidiGenerationRepository.java
package com.midigenerator.repository;

import com.midigenerator.entity.MidiGeneration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MidiGenerationRepository extends JpaRepository<MidiGeneration, Long> {

    Page<MidiGeneration> findByUserIdOrderByGeneratedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT COUNT(mg) FROM MidiGeneration mg WHERE mg.user.id = :userId AND mg.generatedAt >= :startDate")
    Long countByUserIdAndGeneratedAtAfter(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);

    @Query("SELECT mg FROM MidiGeneration mg WHERE mg.user.id = :userId ORDER BY mg.generatedAt DESC")
    List<MidiGeneration> findRecentByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT COUNT(mg) FROM MidiGeneration mg WHERE mg.generatedAt >= :startDate")
    Long countTotalGenerationsSince(@Param("startDate") LocalDateTime startDate);

    void deleteByUserIdAndGeneratedAtBefore(Long userId, LocalDateTime before);

    // ✅ NEW: Count by source
    @Query("SELECT COUNT(mg) FROM MidiGeneration mg WHERE mg.user.id = :userId AND mg.source = :source")
    Long countByUserIdAndSource(@Param("userId") Long userId, @Param("source") String source);

    // ✅ NEW: Count total by user
    @Query("SELECT COUNT(mg) FROM MidiGeneration mg WHERE mg.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);
}