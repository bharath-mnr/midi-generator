//midigenerator/repository/VerificationTokenRepository.java
package com.midigenerator.repository;

import com.midigenerator.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    Optional<VerificationToken> findByToken(String token);

    void deleteByUserIdAndTokenType(Long userId, String tokenType);

    void deleteByExpiryDateBefore(LocalDateTime date);
}