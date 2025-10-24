//midigenerator/controller/MidiGenerationController.java
package com.midigenerator.controller;

import com.midigenerator.dto.generation.*;
import com.midigenerator.entity.MidiGeneration;
import com.midigenerator.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/midi")
@RequiredArgsConstructor
// @CrossOrigin(origins = "*", maxAge = 3600)
public class MidiGenerationController {

    private final MidiGenerationProxyService proxyService;
    private final MidiGenerationService midiGenerationService;

    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateMidi(@Valid @RequestBody GenerationRequest request) {
        return ResponseEntity.ok(proxyService.generateMidi(request));
    }

    @PostMapping("/upload-midi")
    public ResponseEntity<Map<String, Object>> uploadMidi(@RequestBody Map<String, Object> uploadRequest) {
        return ResponseEntity.ok(proxyService.uploadMidi(uploadRequest));
    }

    @GetMapping("/generations")
    public ResponseEntity<Page<MidiGeneration>> getUserGenerations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(midiGenerationService.getUserGenerations(page, size));
    }

    @GetMapping("/generations/{id}")
    public ResponseEntity<MidiGeneration> getGenerationById(@PathVariable Long id) {
        return ResponseEntity.ok(midiGenerationService.getGenerationById(id));
    }

    @DeleteMapping("/generations/{id}")
    public ResponseEntity<Map<String, String>> deleteGeneration(@PathVariable Long id) {
        midiGenerationService.deleteGeneration(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Generation deleted successfully");
        return ResponseEntity.ok(response);
    }
}