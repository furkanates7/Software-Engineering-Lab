package pentacode.backend.code.courier.controller;

import java.util.HashMap;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import pentacode.backend.code.auth.entity.User;
import pentacode.backend.code.common.dto.ReviewDTO;
import pentacode.backend.code.common.utils.ResponseHandler;
import pentacode.backend.code.courier.dto.CourierDTO;
import pentacode.backend.code.courier.entity.Courier;
import pentacode.backend.code.courier.service.CourierService;

@RestController
@RequestMapping("/api/couriers")
public class CourierController {
    private final CourierService courierService;

    public CourierController(CourierService courierService) {
        this.courierService = courierService;
    }

    @GetMapping("/available")
    public ResponseEntity<Object> getAvailableCouriers() {
        List<CourierDTO> couriers = courierService.getAvailableCouriers();
        return ResponseHandler.generateListResponse("Available couriers fetched successfully",
                                                   HttpStatus.OK,
                                                   couriers,
                                                   couriers.size());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getCourierById(@PathVariable("id") Long id, @AuthenticationPrincipal User user) {
        CourierDTO courier = courierService.getByPk(id);
        return ResponseHandler.generatePkResponse("Courier fetched successfully",
                                                 HttpStatus.OK,
                                                 courier);
    }

    @GetMapping("/status")
    public ResponseEntity<Object> getCourierStatus(@AuthenticationPrincipal User user) {
        CourierDTO courier = courierService.getByPk(user.getCourier().getPk());
        return ResponseHandler.generatePkResponse("Courier status fetched successfully",
                                                 HttpStatus.OK,
                                                 courier);
    }

    @PatchMapping("/status")
    public ResponseEntity<Object> updateCourierStatus(
            @RequestBody CourierDTO statusUpdate,
            @AuthenticationPrincipal User user) {
        CourierDTO updatedCourier = courierService.updateCourier(user.getCourier().getPk(), statusUpdate);
        return ResponseHandler.generatePkResponse("Courier profile updated successfully",
                                                 HttpStatus.OK,
                                                 updatedCourier);
    }

    @PostMapping("/profile-picture")
    public ResponseEntity<Object> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) {
        System.out.println("File: " + file.getOriginalFilename());
        System.out.println("File size: " + file.getSize());
        CourierDTO updatedCourier = courierService.updateProfilePicture(user.getCourier().getPk(), file);
        return ResponseHandler.generatePkResponse("Profile picture uploaded successfully",
                                                 HttpStatus.OK,
                                                 updatedCourier);
    }

    @PostMapping("/rate")
    public ResponseEntity<Object> rateCourier(
            @AuthenticationPrincipal User user,
            @RequestParam("orderPk") Long orderPk,
            @RequestParam("rating") Integer rating,
            @RequestBody ReviewDTO reviewDTO) {
        try {
            System.out.println("ASDKASJASASJDASJASJDJASDJASDJASDJAS");
            CourierDTO updatedCourier = courierService.rateCourier(orderPk, rating, reviewDTO, user.getCustomer());
            return ResponseHandler.generatePkResponse("Courier rated successfully",
                                                     HttpStatus.OK,
                                                     updatedCourier);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(e.getMessage());
        }
    }

    @GetMapping("/check-review")
    public ResponseEntity<Object> checkCourierReview(
            @AuthenticationPrincipal User user,
            @RequestParam("orderPk") Long orderPk,
            @RequestParam("courierPk") Long courierPk) {
        try {
            ReviewDTO reviewDTO = courierService.checkCourierReview(orderPk, courierPk);
            return ResponseHandler.generatePkResponse("Review fetched successfully",
                                                     HttpStatus.OK,
                                                     reviewDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(e.getMessage());
        }
    }

    @PostMapping("/delete-review")
    public ResponseEntity<Object> deleteCourierReview(
            @AuthenticationPrincipal User user,
            @RequestParam("reviewPk") Long reviewPk) {
        try {
            courierService.deleteCourierReview(reviewPk);
            return ResponseEntity.ok("Review deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(e.getMessage());
        }
    }

    @PostMapping("/update-review")
    public ResponseEntity<Object> updateCourierReview(
            @AuthenticationPrincipal User user,
            @RequestParam("reviewPk") Long reviewPk,
            @RequestBody ReviewDTO reviewDTO) {
        try {
            ReviewDTO updatedReview = courierService.updateCourierReview(reviewPk, reviewDTO);
            return ResponseHandler.generatePkResponse("Review updated successfully",
                                                     HttpStatus.OK,
                                                     updatedReview);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(e.getMessage());
        }
    }

    @PostMapping("/update-status")
    public ResponseEntity<Object> updateCourierStatus(
            @AuthenticationPrincipal User user) {
        try {
            CourierDTO courierDTO = courierService.updateStatus(user.getCourier());
            return ResponseHandler.generatePkResponse("Courier status updated successfully",
                                                     HttpStatus.OK,
                                                     courierDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(e.getMessage());
        }
    }

    @GetMapping("/get-review-puan")
    public ResponseEntity<Object> getCourierReviewPuan(
            @AuthenticationPrincipal User user) {
        try {
            Courier courier = user.getCourier();
            Double rating = courier.getRating();
            Integer ratingCount = courier.getRatingCount();
            HashMap<String, Object> response = new HashMap<>();
            response.put("rating", rating);
            response.put("ratingCount", ratingCount);
            return ResponseHandler.generatePkResponse("Courier review rating fetched successfully",
                                                     HttpStatus.OK,
                                                     response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(e.getMessage());
        }
    }

}