package com.codewith.firstApp.respository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.codewith.firstApp.entity.FoodItems;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItems, Integer> {

}
