package org.hartford.miniproject.service;

import lombok.RequiredArgsConstructor;
import org.hartford.miniproject.entity.*;
import org.hartford.miniproject.exception.BadRequestException;
import org.hartford.miniproject.exception.ResourceNotFoundException;
import org.hartford.miniproject.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PolicySubscriptionService {
    
    private final PolicySubscriptionRepository subscriptionRepository;
    private final VehicleSubscriptionRepository vehicleSubscriptionRepository;
    private final VehicleRepository vehicleRepository;
    
    public List<PolicySubscription> getAllSubscriptions() {
        return subscriptionRepository.findAll();
    }

    public org.springframework.data.domain.Page<PolicySubscription> getFilteredSubscriptions(String status, String search, org.springframework.data.domain.Pageable pageable) {
        return subscriptionRepository.findByStatusAndSearch(status, search, pageable);
    }
    
    public PolicySubscription getSubscriptionById(Long id) {
        return subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
    }
    
    public List<PolicySubscription> getSubscriptionsByUser(Long userId) {
        return subscriptionRepository.findByOrder_User_UserId(userId);
    }

    public org.springframework.data.domain.Page<PolicySubscription> getFilteredSubscriptionsForUser(Long userId, String status, String search, org.springframework.data.domain.Pageable pageable) {
        return subscriptionRepository.findByUserIdAndStatusAndSearch(userId, status, search, pageable);
    }
    
    public PolicySubscription updateStatus(Long id, String status) {
        PolicySubscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
        subscription.setSubscriptionStatus(status);
        return subscriptionRepository.save(subscription);
    }

    public PolicySubscription renewSubscription(Long subscriptionId) {
        PolicySubscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));

        if (!"EXPIRED".equalsIgnoreCase(subscription.getSubscriptionStatus())) {
            throw new BadRequestException("Only expired subscriptions can be renewed");
        }

        LocalDate renewalStartDate = LocalDate.now();
        subscription.setStartDate(renewalStartDate);
        subscription.setEndDate(renewalStartDate.plusYears(1));
        subscription.setSubscriptionStatus("ACTIVE");
        return subscriptionRepository.save(subscription);
    }
    
    public VehicleSubscription attachVehicle(Long subscriptionId, Long vehicleId) {
        PolicySubscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        if (!"ACTIVE".equalsIgnoreCase(subscription.getSubscriptionStatus())) {
            throw new BadRequestException("Vehicles can only be linked to active subscriptions");
        }

        if (vehicleSubscriptionRepository.existsBySubscription_SubscriptionIdAndVehicle_VehicleId(subscriptionId, vehicleId)) {
            throw new BadRequestException("This vehicle is already linked to the selected subscription");
        }

        vehicleSubscriptionRepository
                .findFirstByVehicle_VehicleIdAndSubscription_Policy_PolicyIdAndSubscription_SubscriptionStatus(
                        vehicleId,
                        subscription.getPolicy().getPolicyId(),
                        "ACTIVE"
                )
                .filter(existing -> !existing.getSubscription().getSubscriptionId().equals(subscriptionId))
                .ifPresent(existing -> {
                    throw new BadRequestException("This vehicle already has an active subscription for this policy.");
                });
        
        VehicleSubscription vs = new VehicleSubscription();
        vs.setSubscription(subscription);
        vs.setVehicle(vehicle);
        return vehicleSubscriptionRepository.save(vs);
    }
    
    public List<VehicleSubscription> getVehiclesBySubscription(Long subscriptionId) {
        return vehicleSubscriptionRepository.findBySubscription_SubscriptionId(subscriptionId);
    }
}
