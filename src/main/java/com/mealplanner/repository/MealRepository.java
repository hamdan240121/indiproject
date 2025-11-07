package com.mealplanner.repository;

import com.mealplanner.model.Meal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MealRepository extends JpaRepository<Meal, Long> {
    List<Meal> findByDate(LocalDate date);
    
    List<Meal> findByDateBetween(LocalDate startDate, LocalDate endDate);
    
    List<Meal> findByMealType(String mealType);
    
    @Query("SELECT m FROM Meal m WHERE m.date BETWEEN :startDate AND :endDate ORDER BY m.date, m.mealType")
    List<Meal> findMealsForWeek(LocalDate startDate, LocalDate endDate);
}


