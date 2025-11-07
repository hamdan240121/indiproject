const API_BASE_URL = '/api/meals';

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    setDefaultDate();
    loadAllMeals();
});

// Set today's date as default
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('selectedDate').value = today;
    document.getElementById('mealDate').value = today;
}

// Load all meals
async function loadAllMeals() {
    try {
        const response = await fetch(API_BASE_URL);
        const meals = await response.json();
        displayMeals(meals);
        updateSectionTitle('All Meals');
    } catch (error) {
        console.error('Error loading meals:', error);
        showError('Failed to load meals');
    }
}

// Load meals for a specific date
async function loadMealsForDate() {
    const dateInput = document.getElementById('selectedDate');
    const date = dateInput.value;
    
    if (!date) {
        alert('Please select a date');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/date/${date}`);
        const meals = await response.json();
        displayMeals(meals);
        updateSectionTitle(`Meals for ${formatDate(date)}`);
    } catch (error) {
        console.error('Error loading meals:', error);
        showError('Failed to load meals for selected date');
    }
}

// Load meals for the current week
async function loadWeekView() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    try {
        const startDate = startOfWeek.toISOString().split('T')[0];
        const endDate = endOfWeek.toISOString().split('T')[0];
        
        const response = await fetch(`${API_BASE_URL}/week?startDate=${startDate}&endDate=${endDate}`);
        const meals = await response.json();
        displayMeals(meals);
        updateSectionTitle('This Week\'s Meals');
    } catch (error) {
        console.error('Error loading week meals:', error);
        showError('Failed to load week meals');
    }
}

// Show all meals
function showAllMeals() {
    loadAllMeals();
}

// Display meals in the grid
function displayMeals(meals) {
    const container = document.getElementById('mealsContainer');
    
    if (meals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No meals found</h3>
                <p>Start by adding your first meal!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = meals.map(meal => `
        <div class="meal-card">
            <div class="meal-card-header">
                <div>
                    <div class="meal-card-title">${escapeHtml(meal.name)}</div>
                    <span class="meal-type-badge meal-type-${meal.mealType}">${meal.mealType}</span>
                </div>
            </div>
            <div class="meal-date">📅 ${formatDate(meal.date)}</div>
            <div class="meal-description">${escapeHtml(meal.description)}</div>
            ${meal.calories ? `<div class="meal-info"><span><strong>Calories:</strong> ${meal.calories}</span></div>` : ''}
            ${meal.ingredients ? `<div class="meal-ingredients"><strong>Ingredients:</strong> ${escapeHtml(meal.ingredients)}</div>` : ''}
            <div class="meal-actions">
                <button class="btn-edit" onclick="editMeal(${meal.id})">Edit</button>
                <button class="btn-danger" onclick="deleteMeal(${meal.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Show add meal form
function showAddForm() {
    document.getElementById('mealFormSection').style.display = 'block';
    document.getElementById('mealsSection').style.display = 'none';
    document.getElementById('formTitle').textContent = 'Add New Meal';
    document.getElementById('mealForm').reset();
    document.getElementById('mealId').value = '';
    setDefaultDate();
}

// Cancel edit
function cancelEdit() {
    document.getElementById('mealFormSection').style.display = 'none';
    document.getElementById('mealsSection').style.display = 'block';
    document.getElementById('mealForm').reset();
    document.getElementById('mealId').value = '';
}

// Edit meal
async function editMeal(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        const meal = await response.json();
        
        document.getElementById('mealId').value = meal.id;
        document.getElementById('mealName').value = meal.name;
        document.getElementById('mealType').value = meal.mealType;
        document.getElementById('mealDate').value = meal.date;
        document.getElementById('description').value = meal.description || '';
        document.getElementById('calories').value = meal.calories || '';
        document.getElementById('ingredients').value = meal.ingredients || '';
        
        document.getElementById('mealFormSection').style.display = 'block';
        document.getElementById('mealsSection').style.display = 'none';
        document.getElementById('formTitle').textContent = 'Edit Meal';
        
        // Scroll to form
        document.getElementById('mealFormSection').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error loading meal:', error);
        showError('Failed to load meal for editing');
    }
}

// Delete meal
async function deleteMeal(id) {
    if (!confirm('Are you sure you want to delete this meal?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadAllMeals();
            showSuccess('Meal deleted successfully');
        } else {
            showError('Failed to delete meal');
        }
    } catch (error) {
        console.error('Error deleting meal:', error);
        showError('Failed to delete meal');
    }
}

// Handle form submission
document.getElementById('mealForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const mealData = {
        name: document.getElementById('mealName').value,
        mealType: document.getElementById('mealType').value,
        date: document.getElementById('mealDate').value,
        description: document.getElementById('description').value,
        calories: document.getElementById('calories').value ? parseInt(document.getElementById('calories').value) : null,
        ingredients: document.getElementById('ingredients').value
    };

    const mealId = document.getElementById('mealId').value;
    const url = mealId ? `${API_BASE_URL}/${mealId}` : API_BASE_URL;
    const method = mealId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mealData)
        });

        if (response.ok) {
            const meal = await response.json();
            showSuccess(mealId ? 'Meal updated successfully' : 'Meal added successfully');
            cancelEdit();
            loadAllMeals();
        } else {
            const error = await response.json();
            showError('Failed to save meal: ' + JSON.stringify(error));
        }
    } catch (error) {
        console.error('Error saving meal:', error);
        showError('Failed to save meal');
    }
});

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateSectionTitle(title) {
    document.getElementById('sectionTitle').textContent = title;
}

function showError(message) {
    alert('Error: ' + message);
}

function showSuccess(message) {
    // You could replace this with a toast notification
    console.log('Success: ' + message);
}


