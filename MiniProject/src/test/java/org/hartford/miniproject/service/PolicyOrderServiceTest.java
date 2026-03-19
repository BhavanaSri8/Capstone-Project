package org.hartford.miniproject.service;

import org.hartford.miniproject.entity.*;
import org.hartford.miniproject.exception.BadRequestException;
import org.hartford.miniproject.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PolicyOrderServiceTest {

    @Mock private PolicyOrderRepository orderRepository;
    @Mock private UserRepository userRepository;
    @Mock private PolicyRepository policyRepository;
    @Mock private PolicySubscriptionRepository subscriptionRepository;
    @Mock private VehicleRepository vehicleRepository;
    @Mock private VehicleSubscriptionRepository vehicleSubscriptionRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private PolicyOrderService service;


    private User buildUser() {
        User u = new User(); u.setUserId(7L); return u;
    }

    private Policy buildPolicy() {
        Policy p = new Policy(); p.setPolicyId(1L); p.setPolicyName("Smart Cover");
        p.setBasePremium(5200.0); return p;
    }

    private Vehicle buildVehicle() {
        Vehicle v = new Vehicle(); v.setVehicleId(99L);
        v.setVehicleNumber("TN01AB1234"); v.setVehicleType("CAR"); v.setStatus("ACTIVE");
        return v;
    }

    private PolicyOrder buildOrder(Vehicle vehicle) {
        PolicyOrder o = new PolicyOrder();
        o.setOrderId(10L);
        o.setUser(buildUser());
        o.setPolicy(buildPolicy());
        o.setOrderStatus("PENDING");
        o.setVehicle(vehicle);
        return o;
    }


    @Test
    void approveOrder_withVehicle_autoLinksVehicleToSubscription() {
        Vehicle vehicle = buildVehicle();
        PolicyOrder order = buildOrder(vehicle);

        PolicySubscription savedSub = new PolicySubscription();
        savedSub.setSubscriptionId(50L);
        savedSub.setPolicy(order.getPolicy());
        savedSub.setOrder(order);
        savedSub.setStartDate(LocalDate.now());
        savedSub.setEndDate(LocalDate.now().plusYears(1));
        savedSub.setSubscriptionStatus("ACTIVE");

        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));
        when(orderRepository.save(order)).thenReturn(order);
        when(subscriptionRepository.save(any(PolicySubscription.class))).thenReturn(savedSub);
        when(vehicleSubscriptionRepository.save(any(VehicleSubscription.class))).thenAnswer(inv -> inv.getArgument(0));

        PolicySubscription result = service.approveOrder(10L);

        assertEquals(50L, result.getSubscriptionId());
        // VehicleSubscription saved with correct vehicle
        ArgumentCaptor<VehicleSubscription> vsCaptor = ArgumentCaptor.forClass(VehicleSubscription.class);
        verify(vehicleSubscriptionRepository).save(vsCaptor.capture());
        assertEquals(99L, vsCaptor.getValue().getVehicle().getVehicleId());
        assertEquals(50L, vsCaptor.getValue().getSubscription().getSubscriptionId());
    }

    @Test
    void approveOrder_withoutVehicle_doesNotCreateVehicleSubscription() {
        PolicyOrder order = buildOrder(null); // no vehicle selected

        PolicySubscription savedSub = new PolicySubscription();
        savedSub.setSubscriptionId(51L);
        savedSub.setPolicy(order.getPolicy());
        savedSub.setOrder(order);
        savedSub.setSubscriptionStatus("ACTIVE");

        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));
        when(orderRepository.save(order)).thenReturn(order);
        when(subscriptionRepository.save(any(PolicySubscription.class))).thenReturn(savedSub);

        PolicySubscription result = service.approveOrder(10L);

        assertEquals(51L, result.getSubscriptionId());
        verify(vehicleSubscriptionRepository, never()).save(any());
    }

    @Test
    void approveOrder_alreadyProcessed_throwsBadRequest() {
        PolicyOrder order = buildOrder(null);
        order.setOrderStatus("APPROVED");

        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> service.approveOrder(10L));
        assertEquals("Order already processed", ex.getMessage());
        verify(vehicleSubscriptionRepository, never()).save(any());
    }

    @Test
    void createOrder_withVehicle_storesVehicleOnOrder() {
        User user = buildUser();
        Policy policy = buildPolicy();
        Vehicle vehicle = buildVehicle();

        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(policyRepository.findById(1L)).thenReturn(Optional.of(policy));
        when(vehicleRepository.findById(99L)).thenReturn(Optional.of(vehicle));
        when(orderRepository.save(any(PolicyOrder.class))).thenAnswer(inv -> {
            PolicyOrder o = inv.getArgument(0); o.setOrderId(77L); return o;
        });

        PolicyOrder result = service.createOrder(7L, 1L, 99L);

        assertEquals(77L, result.getOrderId());
        assertNotNull(result.getVehicle());
        assertEquals(99L, result.getVehicle().getVehicleId());
    }

    @Test
    void createOrder_withoutVehicle_vehicleIsNull() {
        User user = buildUser();
        Policy policy = buildPolicy();

        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(policyRepository.findById(1L)).thenReturn(Optional.of(policy));
        when(orderRepository.save(any(PolicyOrder.class))).thenAnswer(inv -> {
            PolicyOrder o = inv.getArgument(0); o.setOrderId(78L); return o;
        });

        PolicyOrder result = service.createOrder(7L, 1L, null);

        assertEquals(78L, result.getOrderId());
        assertNull(result.getVehicle());
        verify(vehicleRepository, never()).findById(any());
    }
}
