package org.hartford.miniproject.repository;

import org.hartford.miniproject.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    @Query("SELECT v FROM Vehicle v WHERE " +
            "(:status IS NULL OR v.status = :status) AND " +
            "(:search IS NULL OR :search = '' " +
            "OR LOWER(v.vehicleNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(v.vehicleType) LIKE LOWER(CONCAT('%', :search, '%')))")
    org.springframework.data.domain.Page<Vehicle> findByStatusAndSearch(
            @Param("status") String status,
            @Param("search") String search,
            org.springframework.data.domain.Pageable pageable);

    Optional<Vehicle> findByVehicleNumber(String vehicleNumber);
}
