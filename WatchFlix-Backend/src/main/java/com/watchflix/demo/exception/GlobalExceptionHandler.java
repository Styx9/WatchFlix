package com.watchflix.demo.exception;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.sql.SQLException;
@ControllerAdvice
public class GlobalExceptionHandler {
    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
    @ExceptionHandler(SQLException.class)
    public ResponseEntity<Map<String, Object>> handlePSQLException(SQLException ex) {
        String sqlState = ex.getSQLState();
        String message = ex.getMessage();
        if (message != null && message.contains("\n")) {
            message = message.substring(0, message.indexOf("\n")).trim();
        }
        if (message != null && message.startsWith("ERROR: ")) {
            message = message.substring(7);
        }
        return switch (sqlState) {
            case "P0001" -> buildResponse(HttpStatus.NOT_FOUND, message);
            case "P0002" -> buildResponse(HttpStatus.BAD_REQUEST, message);
            case "P0003" -> buildResponse(HttpStatus.BAD_REQUEST, message);
            case "P0004" -> buildResponse(HttpStatus.NOT_FOUND, message);
            case "P0005" -> buildResponse(HttpStatus.BAD_REQUEST, message);
            case "23505" -> buildResponse(HttpStatus.CONFLICT,
                    "Inregistrarea exista deja (duplicat).");
            case "23503" -> buildResponse(HttpStatus.BAD_REQUEST,
                    "Referinta invalida: resursa asociata nu exista.");
            case "23514" -> buildResponse(HttpStatus.BAD_REQUEST,
                    "Valoare invalida: " + message);
            default      -> buildResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Eroare baza de date: " + message);
        };
    }
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFound(ResourceNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                "Eroare interna: " + ex.getMessage());
    }
}

