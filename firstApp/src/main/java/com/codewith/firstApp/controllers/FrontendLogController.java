package com.codewith.firstApp.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/frontend-logs")
public class FrontendLogController {

    private static final Logger log = LoggerFactory.getLogger("frontend");

    @PostMapping
    public void logEvent(@RequestBody Map<String, Object> event) {
        String action = String.valueOf(event.getOrDefault("action", "unknown"));
        String component = String.valueOf(event.getOrDefault("component", "unknown"));
        String details = String.valueOf(event.getOrDefault("details", ""));

        log.info("action={} component={} details={}", action, component, details);
    }
}
