package com.ptm.feedback.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    public record SessionInfo(String username, String role, String displayName, String token) {}

    private final Map<String, SessionInfo> activeSessions = new ConcurrentHashMap<>();

    @Value("${ptm.auth.classteacher-username:classteacher}")
    private String classTeacherUser;

    @Value("${ptm.auth.classteacher-password:classteacher1}")
    private String classTeacherPass;

    @Value("${ptm.auth.principal-username:principal}")
    private String principalUser;

    @Value("${ptm.auth.principal-password:welcome1}")
    private String principalPass;

    @Value("${ptm.auth.admin-username:admin}")
    private String adminUser;

    @Value("${ptm.auth.admin-password:welcome1}")
    private String adminPass;

    public Optional<SessionInfo> authenticate(String username, String password) {
        if (username == null || password == null) {
            return Optional.empty();
        }
        String trimmedUser = username.trim().toLowerCase();

        if (trimmedUser.equalsIgnoreCase(classTeacherUser) && password.equals(classTeacherPass)) {
            return Optional.of(createSession(classTeacherUser, "CLASS_TEACHER", "Class Teacher"));
        }
        if (trimmedUser.equalsIgnoreCase(principalUser) && password.equals(principalPass)) {
            return Optional.of(createSession(principalUser, "PRINCIPAL", "Principal"));
        }
        if (trimmedUser.equalsIgnoreCase(adminUser) && password.equals(adminPass)) {
            return Optional.of(createSession(adminUser, "ADMIN", "Admin"));
        }
        return Optional.empty();
    }

    private SessionInfo createSession(String username, String role, String displayName) {
        String token = UUID.randomUUID().toString();
        SessionInfo info = new SessionInfo(username, role, displayName, token);
        activeSessions.put(token, info);
        return info;
    }

    public Optional<SessionInfo> validateToken(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            return Optional.empty();
        }
        String token = authHeader.startsWith("Bearer ")
            ? authHeader.substring(7).trim()
            : authHeader.trim();
        return Optional.ofNullable(activeSessions.get(token));
    }

    public void logout(String authHeader) {
        if (authHeader == null) {
            return;
        }
        String token = authHeader.startsWith("Bearer ")
            ? authHeader.substring(7).trim()
            : authHeader.trim();
        activeSessions.remove(token);
    }
}
