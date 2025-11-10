// // backend/src/main/java/com/midigenerator/controller/HealthController.java
// package com.midigenerator.controller;

// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.util.HashMap;
// import java.util.Map;

// @RestController
// @RequestMapping("/api")
// public class HealthController {

//     @GetMapping("/health")
//     public ResponseEntity<Map<String, Object>> health() {
//         Map<String, Object> response = new HashMap<>();
//         response.put("status", "healthy");
//         response.put("service", "MIDI Generator API");
//         response.put("timestamp", System.currentTimeMillis());
//         return ResponseEntity.ok(response);
//     }
// }







package com.midigenerator.controller;

import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.HikariPoolMXBean;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class HealthController {

    private final DataSource dataSource;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("service", "MIDI Generator API");
        response.put("timestamp", System.currentTimeMillis());

        // ✅ Add connection pool stats
        if (dataSource instanceof HikariDataSource) {
            HikariDataSource hikariDataSource = (HikariDataSource) dataSource;
            HikariPoolMXBean poolMXBean = hikariDataSource.getHikariPoolMXBean();

            Map<String, Object> poolStats = new HashMap<>();
            poolStats.put("active", poolMXBean.getActiveConnections());
            poolStats.put("idle", poolMXBean.getIdleConnections());
            poolStats.put("total", poolMXBean.getTotalConnections());
            poolStats.put("waiting", poolMXBean.getThreadsAwaitingConnection());

            response.put("connectionPool", poolStats);

            // ✅ Warn if pool is exhausted
            if (poolMXBean.getActiveConnections() >= 18) { // 90% of 20
                response.put("warning", "Connection pool near capacity");
            }
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/health/detailed")
    public ResponseEntity<Map<String, Object>> detailedHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("timestamp", System.currentTimeMillis());

        if (dataSource instanceof HikariDataSource) {
            HikariDataSource hikariDataSource = (HikariDataSource) dataSource;
            HikariPoolMXBean poolMXBean = hikariDataSource.getHikariPoolMXBean();

            Map<String, Object> poolDetails = new HashMap<>();
            poolDetails.put("activeConnections", poolMXBean.getActiveConnections());
            poolDetails.put("idleConnections", poolMXBean.getIdleConnections());
            poolDetails.put("totalConnections", poolMXBean.getTotalConnections());
            poolDetails.put("threadsAwaitingConnection", poolMXBean.getThreadsAwaitingConnection());
            poolDetails.put("maxPoolSize", hikariDataSource.getMaximumPoolSize());
            poolDetails.put("minIdle", hikariDataSource.getMinimumIdle());

            response.put("hikariPool", poolDetails);

            // Health status based on pool usage
            int activePercent = (poolMXBean.getActiveConnections() * 100) / hikariDataSource.getMaximumPoolSize();
            if (activePercent > 90) {
                response.put("status", "degraded");
                response.put("reason", "Connection pool at " + activePercent + "% capacity");
            } else if (activePercent > 70) {
                response.put("status", "warning");
                response.put("reason", "Connection pool at " + activePercent + "% capacity");
            }
        }

        return ResponseEntity.ok(response);
    }
}