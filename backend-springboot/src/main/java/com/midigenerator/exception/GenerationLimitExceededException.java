package com.midigenerator.exception;

public class GenerationLimitExceededException extends RuntimeException {
    public GenerationLimitExceededException(String message) {
        super(message);
    }
}
