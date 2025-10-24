//midigenerator/entity/Role.java
package com.midigenerator.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Role Entity
 * Represents user roles in the system (USER, ADMIN)
 */
@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(unique = true, nullable = false, length = 20)
    private RoleName name;
    
    /**
     * Enum representing available role names
     */
    public enum RoleName {
        ROLE_USER,
        ROLE_ADMIN
    }
}