package com.codewith.firstApp.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.codewith.firstApp.entity.FoodItems;
import com.codewith.firstApp.respository.FoodItemRepository;

@RestController
@RequestMapping("/api/foods")
public class FoodItemControler {

    private final FoodItemRepository foodItemRepository;

    public FoodItemControler(FoodItemRepository foodItemRepository) {
        this.foodItemRepository = foodItemRepository;
    }
    
    @GetMapping
    public List<FoodItems> getAllFoodItems(){
        return foodItemRepository.findAll();
    }

    @PostMapping
    public FoodItems addFoodItem(FoodItems foodItem){
        return foodItemRepository.save(foodItem);
    }

    @GetMapping("/{id}")
    public FoodItems getFoodItemById(@PathVariable Integer id){
        return foodItemRepository.findById(id).orElse(null);
    }
    
    @PutMapping("/{id}")
    public FoodItems updateFoodItem(@PathVariable Integer id, FoodItems foodItem){
        FoodItems existingFoodItem = foodItemRepository.findById(id).orElse(null);
        if(existingFoodItem != null){
            existingFoodItem.setName(foodItem.getName());
            existingFoodItem.setPrice(foodItem.getPrice());
            return foodItemRepository.save(existingFoodItem);
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public void deleteFoodItem(@PathVariable Integer id){
        foodItemRepository.deleteById(id);
    }

    
}
