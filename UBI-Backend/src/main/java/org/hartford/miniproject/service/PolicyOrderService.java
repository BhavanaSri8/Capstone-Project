package org.hartford.miniproject.service;

import lombok.extern.slf4j.Slf4j;
import org.hartford.miniproject.entity.*;
import org.hartford.miniproject.exception.*;
import org.hartford.miniproject.repository.*;
import org.hartford.miniproject.dto.PolicyOrderResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.*;

@Service
public class PolicyOrderService {
    
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "jpg", "jpeg", "png");
    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024L * 1024L;
    
    private final PolicyOrderRepository orderRepository;
    private final UserRepository userRepository;
    private final PolicyRepository policyRepository;
    private final PolicySubscriptionRepository subscriptionRepository;
    private final VehicleRepository vehicleRepository;
    private final VehicleSubscriptionRepository vehicleSubscriptionRepository;
    private final NotificationService notificationService;

    @Value("${policy-orders.upload-dir:./data/policy-documents}")
    private String uploadDir;

    public PolicyOrderService(
            PolicyOrderRepository orderRepository,
            UserRepository userRepository,
            PolicyRepository policyRepository,
            PolicySubscriptionRepository subscriptionRepository,
            VehicleRepository vehicleRepository,
            VehicleSubscriptionRepository vehicleSubscriptionRepository,
            NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.policyRepository = policyRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.vehicleRepository = vehicleRepository;
        this.vehicleSubscriptionRepository = vehicleSubscriptionRepository;
        this.notificationService = notificationService;
    }
    
    public PolicyOrder createOrder(Long userId, Long policyId, Long vehicleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found"));
        
        PolicyOrder order = new PolicyOrder();
        order.setUser(user);
        order.setPolicy(policy);

        if (vehicleId != null) {
            Vehicle vehicle = vehicleRepository.findById(vehicleId)
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
            order.setVehicle(vehicle);
        }

        PolicyOrder savedOrder = orderRepository.save(order);

        // Notify Underwriters
        notificationService.notifyRole(
            "UNDERWRITER",
            "New Policy Application",
            "A new application has been submitted by " + user.getFullName(),
            "NEW_APPLICATION"
        );

        return savedOrder;
    }

    @Transactional
    public PolicyOrder createOrderWithDocuments(Long userId, Long policyId, Long vehicleId, List<MultipartFile> documents) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found"));
        
        PolicyOrder order = new PolicyOrder();
        order.setUser(user);
        order.setPolicy(policy);

        if (vehicleId != null) {
            Vehicle vehicle = vehicleRepository.findById(vehicleId)
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
            order.setVehicle(vehicle);
        }

        order = orderRepository.save(order);

        if (documents != null && !documents.isEmpty()) {
            validateDocuments(documents);
            storeDocuments(order, documents);
            order = orderRepository.save(order);
        }

        // Notify Underwriters
        notificationService.notifyRole(
            "UNDERWRITER",
            "New Policy Application",
            "A new application with documents has been submitted by " + user.getFullName(),
            "NEW_APPLICATION"
        );

        return order;
    }
    
    public List<PolicyOrder> getAllOrders() {
        return orderRepository.findAll();
    }
    
    public List<PolicyOrder> getOrdersByUser(Long userId) {
        return orderRepository.findByUser_UserId(userId);
    }

    public org.springframework.data.domain.Page<PolicyOrder> getFilteredOrders(String status, String search, org.springframework.data.domain.Pageable pageable) {
        return orderRepository.findByStatusAndSearch(status, search, pageable);
    }
    
    @Transactional(readOnly = true)
    public PolicyOrderResponse getOrderById(Long orderId) {
        PolicyOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        return toResponse(order);
    }

    private PolicyOrderResponse toResponse(PolicyOrder order) {
        return new PolicyOrderResponse(
                order.getOrderId(),
                order.getUser().getUserId(),
                order.getUser().getFullName(),
                order.getPolicy().getPolicyId(),
                order.getPolicy().getPolicyName(),
                order.getPolicy().getCoverageType(),
                order.getPolicy().getDescription(),
                order.getPolicy().getBasePremium(),
                order.getOrderDate(),
                order.getOrderStatus()
        );
    }
    
    @Transactional
    public PolicySubscription approveOrder(Long orderId) {
        PolicyOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        if (!order.getOrderStatus().equals("PENDING")) {
            throw new BadRequestException("Order already processed");
        }
        
        order.setOrderStatus("APPROVED");
        orderRepository.save(order);
        
        PolicySubscription subscription = new PolicySubscription();
        subscription.setOrder(order);
        subscription.setPolicy(order.getPolicy());
        subscription.setStartDate(LocalDate.now());
        subscription.setEndDate(LocalDate.now().plusYears(1));
        
        PolicySubscription saved = subscriptionRepository.save(subscription);

        // Auto-link the vehicle chosen during application
        if (order.getVehicle() != null) {
            VehicleSubscription vs = new VehicleSubscription();
            vs.setSubscription(saved);
            vs.setVehicle(order.getVehicle());
            vehicleSubscriptionRepository.save(vs);
        }

        return saved;
    }
    
    public void rejectOrder(Long orderId) {
        PolicyOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setOrderStatus("REJECTED");
        orderRepository.save(order);
    }

    private void validateDocuments(List<MultipartFile> documents) {
        for (MultipartFile file : documents) {
            if (file == null || file.isEmpty()) {
                throw new BadRequestException("Uploaded file cannot be empty");
            }

            String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
            int dotIndex = originalName.lastIndexOf('.');
            String extension = dotIndex >= 0 ? originalName.substring(dotIndex + 1).toLowerCase() : "";

            if (!ALLOWED_EXTENSIONS.contains(extension)) {
                throw new BadRequestException("Unsupported file format for " + originalName + ". Allowed formats: PDF, JPG, JPEG, PNG");
            }

            if (file.getSize() > MAX_FILE_SIZE_BYTES) {
                throw new BadRequestException("File " + originalName + " exceeds 5 MB limit");
            }
        }
    }

    private void storeDocuments(PolicyOrder order, List<MultipartFile> documents) {
        Path orderFolder = Paths.get(uploadDir, String.valueOf(order.getOrderId()));
        List<String> originalNames = new java.util.ArrayList<>();
        List<String> storedNames = new java.util.ArrayList<>();

        try {
            Files.createDirectories(orderFolder);
            for (MultipartFile file : documents) {
                String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "document" : file.getOriginalFilename());
                String storedName = UUID.randomUUID() + "_" + originalName.replace(" ", "_");
                Path target = orderFolder.resolve(storedName);
                Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
                originalNames.add(originalName);
                storedNames.add(storedName);
            }
        } catch (IOException ex) {
            throw new BadRequestException("Failed to store policy application documents");
        }

        order.setDocumentNames(String.join(",", originalNames));
        order.setStoredDocumentNames(String.join(",", storedNames));
    }

    public byte[] getDocumentBytes(Long orderId, String documentName) throws IOException {
        PolicyOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        // Verify the document belongs to this order and prevent directory traversal
        String storedNames = order.getStoredDocumentNames();
        if (storedNames == null || !storedNames.contains(documentName)) {
            throw new BadRequestException("Document not found for this order");
        }
        
        Path filePath = Paths.get(uploadDir, String.valueOf(orderId), documentName);
        
        // Security: Ensure the file is within the expected directory
        // Use absolute paths instead of toRealPath() to avoid issues with non-existent files
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
        Path resolvedFile = filePath.toAbsolutePath();
        
        if (!resolvedFile.startsWith(uploadPath)) {
            throw new BadRequestException("Invalid file path");
        }
        
           if (!Files.exists(resolvedFile)) {
               throw new ResourceNotFoundException("Document file not found on disk: " + resolvedFile);
        }
        
        return Files.readAllBytes(resolvedFile);
    }
}

