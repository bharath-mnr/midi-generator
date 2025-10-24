//midigenerator/service/MidiGenerationService.java
package com.midigenerator.service;

import com.midigenerator.entity.*;
import com.midigenerator.exception.*;
import com.midigenerator.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class MidiGenerationService {

    private final MidiGenerationRepository midiGenerationRepository;
    private final UserService userService;

    public Page<MidiGeneration> getUserGenerations(int page, int size) {
        User user = userService.getCurrentUser();

        // Validate pagination parameters
        if (page < 0) page = 0;
        if (size < 1 || size > 100) size = 10;

        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "generatedAt"));
            return midiGenerationRepository.findByUserIdOrderByGeneratedAtDesc(user.getId(), pageable);
        } catch (Exception e) {
            log.error("Error fetching generations for user {}: {}", user.getEmail(), e.getMessage(), e);
            // Return empty page on error
            return Page.empty(PageRequest.of(page, size));
        }
    }

    @Transactional
    public MidiGeneration getGenerationById(Long id) {
        User user = userService.getCurrentUser();

        MidiGeneration generation = midiGenerationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("Generation with ID %d not found", id)));

        // Check ownership
        if (!generation.getUser().getId().equals(user.getId())) {
            log.warn("User {} attempted to access generation {} owned by user {}",
                    user.getId(), id, generation.getUser().getId());
            throw new UnauthorizedAccessException("You don't have permission to access this generation");
        }

        // Update last accessed timestamp
        generation.setLastAccessedAt(LocalDateTime.now());
        return midiGenerationRepository.save(generation);
    }

    @Transactional
    public void deleteGeneration(Long id) {
        MidiGeneration generation = getGenerationById(id); // Checks ownership
        log.info("Deleting generation {} for user {}", id, generation.getUser().getEmail());
        midiGenerationRepository.delete(generation);
    }
}