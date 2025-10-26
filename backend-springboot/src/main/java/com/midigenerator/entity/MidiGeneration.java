
package com.midigenerator.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "midi_generations", indexes = {
        @Index(name = "idx_user_generated", columnList = "user_id, generated_at"),
        @Index(name = "idx_generated_at", columnList = "generated_at"),
        @Index(name = "idx_file_name", columnList = "file_name"),
        @Index(name = "idx_user_source", columnList = "user_id, source"),  
        @Index(name = "idx_midi_gen_source", columnList = "source"),      
        @Index(name = "idx_user_id", columnList = "user_id")            
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MidiGeneration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 255)
    private String fileName;

    @Column(length = 500)
    private String midiUrl;

    @Column(columnDefinition = "TEXT")
    private String textMidi;

    @Column
    private Integer barCount;

    @Column
    private Integer voiceCount;

    @Column(length = 20)
    private String creativityLevel;

    @Column(length = 20)
    private String performanceMode;

    @Column(nullable = false)
    private Boolean isEdited = false;

    @Column(columnDefinition = "TEXT")
    private String originalPrompt;

    @Column(length = 10, nullable = false)  // ✅ FIXED: Made not null with default
    private String source = "web";

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime generatedAt;

    @Column
    private LocalDateTime lastAccessedAt;

    public void updateLastAccessed() {
        this.lastAccessedAt = LocalDateTime.now();
    }
}
