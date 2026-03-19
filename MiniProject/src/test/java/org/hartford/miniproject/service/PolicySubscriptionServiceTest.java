package org.hartford.miniproject.service;

import org.hartford.miniproject.entity.Policy;
import org.hartford.miniproject.entity.PolicyOrder;
import org.hartford.miniproject.entity.PolicySubscription;
import org.hartford.miniproject.entity.User;
import org.hartford.miniproject.entity.Vehicle;
import org.hartford.miniproject.entity.VehicleSubscription;
import org.hartford.miniproject.exception.BadRequestException;
import org.hartford.miniproject.repository.PolicySubscriptionRepository;
import org.hartford.miniproject.repository.VehicleRepository;
import org.hartford.miniproject.repository.VehicleSubscriptionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PolicySubscriptionServiceTest {

    @Mock
    private PolicySubscriptionRepository subscriptionRepository;

    @Mock
    private VehicleSubscriptionRepository vehicleSubscriptionRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private PolicySubscriptionService policySubscriptionService;

    @Test
    void renewSubscriptionReactivatesExpiredSubscription() {
        PolicySubscription expiredSubscription = buildSubscription(10L, "EXPIRED");
        when(subscriptionRepository.findById(10L)).thenReturn(Optional.of(expiredSubscription));
        when(subscriptionRepository.save(expiredSubscription)).thenReturn(expiredSubscription);

        PolicySubscription renewed = policySubscriptionService.renewSubscription(10L);

        assertEquals("ACTIVE", renewed.getSubscriptionStatus());
        assertEquals(LocalDate.now(), renewed.getStartDate());
        assertEquals(LocalDate.now().plusYears(1), renewed.getEndDate());
        verify(subscriptionRepository).save(expiredSubscription);
    }

    @Test
    void renewSubscriptionRejectsNonExpiredSubscription() {
        PolicySubscription activeSubscription = buildSubscription(10L, "ACTIVE");
        when(subscriptionRepository.findById(10L)).thenReturn(Optional.of(activeSubscription));

        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> policySubscriptionService.renewSubscription(10L)
        );

        assertEquals("Only expired subscriptions can be renewed", exception.getMessage());
        verify(subscriptionRepository, never()).save(any());
    }

    @Test
    void attachVehicleBlocksDuplicateActiveVehicleForSamePolicy() {
        PolicySubscription targetSubscription = buildSubscription(10L, "ACTIVE");
        Vehicle vehicle = buildVehicle(99L);
        VehicleSubscription existingActiveLink = new VehicleSubscription();
        existingActiveLink.setVehicleSubscriptionId(500L);
        existingActiveLink.setSubscription(buildSubscription(11L, "ACTIVE"));
        existingActiveLink.setVehicle(vehicle);

        when(subscriptionRepository.findById(10L)).thenReturn(Optional.of(targetSubscription));
        when(vehicleRepository.findById(99L)).thenReturn(Optional.of(vehicle));
        when(vehicleSubscriptionRepository.existsBySubscription_SubscriptionIdAndVehicle_VehicleId(10L, 99L)).thenReturn(false);
        when(vehicleSubscriptionRepository.findFirstByVehicle_VehicleIdAndSubscription_Policy_PolicyIdAndSubscription_SubscriptionStatus(99L, 1L, "ACTIVE"))
                .thenReturn(Optional.of(existingActiveLink));

        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> policySubscriptionService.attachVehicle(10L, 99L)
        );

        assertEquals("This vehicle already has an active subscription for this policy.", exception.getMessage());
        verify(vehicleSubscriptionRepository, never()).save(any());
    }

    @Test
    void attachVehicleAllowsNewVehicleWhenNoActiveDuplicateExists() {
        PolicySubscription targetSubscription = buildSubscription(10L, "ACTIVE");
        Vehicle vehicle = buildVehicle(99L);
        VehicleSubscription savedLink = new VehicleSubscription();
        savedLink.setVehicleSubscriptionId(500L);
        savedLink.setSubscription(targetSubscription);
        savedLink.setVehicle(vehicle);

        when(subscriptionRepository.findById(10L)).thenReturn(Optional.of(targetSubscription));
        when(vehicleRepository.findById(99L)).thenReturn(Optional.of(vehicle));
        when(vehicleSubscriptionRepository.existsBySubscription_SubscriptionIdAndVehicle_VehicleId(10L, 99L)).thenReturn(false);
        when(vehicleSubscriptionRepository.findFirstByVehicle_VehicleIdAndSubscription_Policy_PolicyIdAndSubscription_SubscriptionStatus(99L, 1L, "ACTIVE"))
                .thenReturn(Optional.empty());
        when(vehicleSubscriptionRepository.save(any(VehicleSubscription.class))).thenReturn(savedLink);

        VehicleSubscription result = policySubscriptionService.attachVehicle(10L, 99L);

        assertEquals(500L, result.getVehicleSubscriptionId());
        assertEquals(10L, result.getSubscription().getSubscriptionId());
        assertEquals(99L, result.getVehicle().getVehicleId());
        verify(vehicleSubscriptionRepository).save(any(VehicleSubscription.class));
    }

    @Test
    void attachVehicleRejectsInactiveSubscription() {
        PolicySubscription expiredSubscription = buildSubscription(10L, "EXPIRED");
        Vehicle vehicle = buildVehicle(99L);

        when(subscriptionRepository.findById(10L)).thenReturn(Optional.of(expiredSubscription));
        when(vehicleRepository.findById(99L)).thenReturn(Optional.of(vehicle));

        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> policySubscriptionService.attachVehicle(10L, 99L)
        );

        assertTrue(exception.getMessage().contains("active subscriptions"));
        verify(vehicleSubscriptionRepository, never()).save(any());
    }

    private PolicySubscription buildSubscription(Long subscriptionId, String status) {
        Policy policy = new Policy();
        policy.setPolicyId(1L);
        policy.setPolicyName("Smart Cover");
        policy.setBasePremium(5200.0);

        PolicyOrder order = new PolicyOrder();
        order.setOrderId(5L);
        order.setPolicy(policy);
        order.setUser(new User());

        PolicySubscription subscription = new PolicySubscription();
        subscription.setSubscriptionId(subscriptionId);
        subscription.setPolicy(policy);
        subscription.setOrder(order);
        subscription.setStartDate(LocalDate.now().minusYears(1));
        subscription.setEndDate(LocalDate.now().minusDays(1));
        subscription.setSubscriptionStatus(status);
        return subscription;
    }

    private Vehicle buildVehicle(Long vehicleId) {
        Vehicle vehicle = new Vehicle();
        vehicle.setVehicleId(vehicleId);
        vehicle.setVehicleNumber("TS09AB1234");
        vehicle.setVehicleType("CAR");
        vehicle.setStatus("ACTIVE");
        return vehicle;
    }
}