package org.hartford.miniproject.controller;

import jakarta.validation.Valid;
import org.hartford.miniproject.dto.QuoteRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/quotes")
public class QuoteController {

    @PostMapping
    public ResponseEntity<Map<String, String>> submitQuote(@Valid @RequestBody QuoteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Quote request submitted successfully"));
    }
}
