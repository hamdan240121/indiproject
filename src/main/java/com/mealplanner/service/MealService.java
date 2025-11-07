package com.mealplanner.service;

import com.mealplanner.model.Meal;
import com.mealplanner.repository.MealRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class MealService {
    
    @Autowired
    private MealRepository mealRepository;

    public List<Meal> getAllMeals() {
        return mealRepository.findAll();
    }

    public Optional<Meal> getMealById(Long id) {
        return mealRepository.findById(id);
    }

    public List<Meal> getMealsByDate(LocalDate date) {
        return mealRepository.findByDate(date);
    }

    public List<Meal> getMealsForWeek(LocalDate startDate, LocalDate endDate) {
        return mealRepository.findMealsForWeek(startDate, endDate);
    }

    public Meal saveMeal(Meal meal) {
        return mealRepository.save(meal);
    }

    public void deleteMeal(Long id) {
        mealRepository.deleteById(id);
    }

    public Meal updateMeal(Long id, Meal mealDetails) {
        Meal meal = mealRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meal not found with id: " + id));
        
        meal.setName(mealDetails.getName());
        meal.setDescription(mealDetails.getDescription());
        meal.setMealType(mealDetails.getMealType());
        meal.setDate(mealDetails.getDate());
        meal.setCalories(mealDetails.getCalories());
        meal.setIngredients(mealDetails.getIngredients());
        
        return mealRepository.save(meal);
    }
}


