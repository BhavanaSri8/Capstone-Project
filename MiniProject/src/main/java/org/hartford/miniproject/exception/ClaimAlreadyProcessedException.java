package org.hartford.miniproject.exception;

public class ClaimAlreadyProcessedException extends RuntimeException {
    public ClaimAlreadyProcessedException(String message) {
        super(message);
    }
}
