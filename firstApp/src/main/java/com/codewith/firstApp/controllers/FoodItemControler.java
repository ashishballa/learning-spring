package com.codewith.firstApp.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.codewith.firstApp.entity.AuditLog;
import com.codewith.firstApp.entity.FoodItems;
import com.codewith.firstApp.respository.AuditLogRepository;
import com.codewith.firstApp.respository.FoodItemRepository;

@RestController
@RequestMapping("/api/foods")
public class FoodItemControler {

    private final FoodItemRepository foodItemRepository;
    private final AuditLogRepository auditLogRepository;

    public FoodItemControler(FoodItemRepository foodItemRepository, AuditLogRepository auditLogRepository) {
        this.foodItemRepository = foodItemRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    public List<FoodItems> getAllFoodItems(){
        return foodItemRepository.findAll();
    }

    @PostMapping
    public FoodItems addFoodItem(@RequestBody FoodItems foodItem){
        FoodItems saved = foodItemRepository.save(foodItem);
        auditLogRepository.save(new AuditLog(
            "CREATE",
            saved.getId(),
            saved.getName(),
            "Created food item: " + saved.getName() + " @ $" + saved.getPrice()
        ));
        return saved;
    }

    @GetMapping("/{id}")
    public FoodItems getFoodItemById(@PathVariable Integer id){
        return foodItemRepository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public FoodItems updateFoodItem(@PathVariable Integer id, @RequestBody FoodItems foodItem){
        FoodItems existingFoodItem = foodItemRepository.findById(id).orElse(null);
        if(existingFoodItem != null){
            double oldPrice = existingFoodItem.getPrice();
            existingFoodItem.setName(foodItem.getName());
            existingFoodItem.setPrice(foodItem.getPrice());
            FoodItems updated = foodItemRepository.save(existingFoodItem);
            auditLogRepository.save(new AuditLog(
                "UPDATE",
                updated.getId(),
                updated.getName(),
                "Updated food item: " + updated.getName() + " — price: $" + oldPrice + " → $" + updated.getPrice()
            ));
            return updated;
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public void deleteFoodItem(@PathVariable Integer id){
        FoodItems existing = foodItemRepository.findById(id).orElse(null);
        if (existing != null) {
            auditLogRepository.save(new AuditLog(
                "DELETE",
                existing.getId(),
                existing.getName(),
                "Deleted food item: " + existing.getName() + " (id: " + existing.getId() + ")"
            ));
        }
        foodItemRepository.deleteById(id);
    }


}
