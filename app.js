// App Data and Configuration
const APP_CONFIG = {
    dailyGoals: {
        calories: 1500,
        protein: 80,
        carbs: 201,
        fat: 42,
        fiber: 25
    },
    chartColors: {
        calories: '#3B82F6',
        protein: '#EF4444',
        fiber: '#10B981'
    },
    mealTypes: ['breakfast', 'lunch', 'dinner', 'snack']
};

// Sample data for demonstration
const SAMPLE_MEALS = [
    {
        id: 1,
        name: "Oatmeal with Berries",
        type: "breakfast",
        calories: 320,
        protein: 12,
        carbs: 58,
        fat: 6,
        fiber: 8,
        date: "2025-08-08"
    },
    {
        id: 2,
        name: "Grilled Chicken Salad",
        type: "lunch", 
        calories: 450,
        protein: 35,
        carbs: 25,
        fat: 18,
        fiber: 12,
        date: "2025-08-08"
    },
    {
        id: 3,
        name: "Greek Yogurt",
        type: "snack",
        calories: 150,
        protein: 20,
        carbs: 15,
        fat: 0,
        fiber: 0,
        date: "2025-08-07"
    }
];

// Global state
let currentDate = new Date();
let meals = [];
let progressChart = null;
let calculatedNutrition = null;

// Utility Functions
function formatDate(date) {
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function dateToString(date) {
    return date.toISOString().split('T')[0];
}

function stringToDate(dateStr) {
    return new Date(dateStr + 'T00:00:00');
}

// Data Management
function initializeData() {
    const savedMeals = localStorage.getItem('yumyum-meals');
    if (savedMeals) {
        try {
            meals = JSON.parse(savedMeals);
        } catch (e) {
            meals = [...SAMPLE_MEALS];
            saveMeals();
        }
    } else {
        meals = [...SAMPLE_MEALS];
        saveMeals();
    }
}

function saveMeals() {
    localStorage.setItem('yumyum-meals', JSON.stringify(meals));
}

function getMealsForDate(date) {
    const dateStr = dateToString(date);
    return meals.filter(meal => meal.date === dateStr);
}

function addMeal(mealData) {
    const newMeal = {
        id: Date.now(),
        ...mealData,
        date: dateToString(currentDate)
    };
    meals.push(newMeal);
    saveMeals();
    updateDashboard();
    updateDailyLog();
}

function deleteMeal(mealId) {
    meals = meals.filter(meal => meal.id !== mealId);
    saveMeals();
    updateDashboard();
    updateDailyLog();
}

function calculateDailyTotals(date) {
    const dailyMeals = getMealsForDate(date);
    return dailyMeals.reduce((totals, meal) => ({
        calories: totals.calories + meal.calories,
        protein: totals.protein + meal.protein,
        carbs: totals.carbs + meal.carbs,
        fat: totals.fat + meal.fat,
        fiber: totals.fiber + meal.fiber
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
}

// Navigation Functions
function initializeNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    navTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = tab.getAttribute('data-tab');
            
            console.log('Switching to tab:', targetTab);
            
            // Update active tab
            navTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active content
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // Initialize tab-specific content
            if (targetTab === 'progress') {
                setTimeout(updateProgressChart, 100);
            }
        });
    });
}

// Dashboard Functions
function updateDashboard() {
    const totals = calculateDailyTotals(currentDate);
    
    // Update date display
    const dashboardDateEl = document.getElementById('current-date-dashboard');
    if (dashboardDateEl) {
        dashboardDateEl.textContent = formatDate(currentDate);
    }
    
    // Update nutrition circles
    updateNutritionCircle('calories', totals.calories, APP_CONFIG.dailyGoals.calories);
    updateNutritionCircle('protein', totals.protein, APP_CONFIG.dailyGoals.protein);
    updateNutritionCircle('carbs', totals.carbs, APP_CONFIG.dailyGoals.carbs);
    updateNutritionCircle('fat', totals.fat, APP_CONFIG.dailyGoals.fat);
    updateNutritionCircle('fiber', totals.fiber, APP_CONFIG.dailyGoals.fiber);
}

function updateNutritionCircle(nutrient, current, goal) {
    const circle = document.getElementById(`${nutrient}-circle`);
    const valueEl = document.getElementById(`${nutrient}-value`);
    
    if (!circle || !valueEl) return;
    
    const percentage = Math.min((current / goal) * 100, 100);
    const circumference = 283; // 2 * π * 45
    const offset = circumference - (percentage / 100) * circumference;
    
    circle.style.strokeDashoffset = offset;
    valueEl.textContent = Math.round(current);
}

function initializeDashboardDateNavigation() {
    const prevBtn = document.getElementById('prev-date-dashboard');
    const nextBtn = document.getElementById('next-date-dashboard');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            currentDate.setDate(currentDate.getDate() - 1);
            updateDashboard();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            currentDate.setDate(currentDate.getDate() + 1);
            updateDashboard();
        });
    }
}

// Daily Log Functions
function updateDailyLog() {
    const dailyMeals = getMealsForDate(currentDate);
    
    // Update date display
    const logDateEl = document.getElementById('current-date-log');
    if (logDateEl) {
        logDateEl.textContent = formatDate(currentDate);
    }
    
    // Clear existing meals
    APP_CONFIG.mealTypes.forEach(type => {
        const container = document.getElementById(`${type}-meals`);
        if (container) {
            container.innerHTML = '';
        }
    });
    
    // Group meals by type
    const mealsByType = dailyMeals.reduce((groups, meal) => {
        if (!groups[meal.type]) groups[meal.type] = [];
        groups[meal.type].push(meal);
        return groups;
    }, {});
    
    // Render meals
    Object.entries(mealsByType).forEach(([type, typeMeals]) => {
        const container = document.getElementById(`${type}-meals`);
        if (container) {
            typeMeals.forEach(meal => {
                container.appendChild(createMealElement(meal));
            });
        }
    });
    
    // Add empty state for empty meal types
    APP_CONFIG.mealTypes.forEach(type => {
        const container = document.getElementById(`${type}-meals`);
        if (container && container.children.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.textContent = `No ${type} logged yet`;
            container.appendChild(emptyState);
        }
    });
}

function createMealElement(meal) {
    const mealEl = document.createElement('div');
    mealEl.className = 'meal-item';
    mealEl.innerHTML = `
        <div class="meal-info">
            <h3>${meal.name}</h3>
            <div class="meal-nutrition">
                <span>${meal.calories} cal</span>
                <span>${meal.protein}g protein</span>
                <span>${meal.carbs}g carbs</span>
                <span>${meal.fat}g fat</span>
                <span>${meal.fiber}g fiber</span>
            </div>
        </div>
        <div class="meal-actions">
            <button class="btn btn--outline btn--sm delete-meal-btn" data-meal-id="${meal.id}">Delete</button>
        </div>
    `;
    
    // Add delete functionality
    const deleteBtn = mealEl.querySelector('.delete-meal-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this meal?')) {
                deleteMeal(meal.id);
            }
        });
    }
    
    return mealEl;
}

function initializeDailyLogDateNavigation() {
    const prevBtn = document.getElementById('prev-date-log');
    const nextBtn = document.getElementById('next-date-log');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            currentDate.setDate(currentDate.getDate() - 1);
            updateDailyLog();
            updateDashboard();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            currentDate.setDate(currentDate.getDate() + 1);
            updateDailyLog();
            updateDashboard();
        });
    }
}

// Progress Chart Functions
function updateProgressChart() {
    const canvas = document.getElementById('progress-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (progressChart) {
        progressChart.destroy();
    }
    
    const chartData = getChartData();
    
    progressChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [
                {
                    label: 'Calories',
                    data: chartData.calories,
                    backgroundColor: APP_CONFIG.chartColors.calories + '80',
                    borderColor: APP_CONFIG.chartColors.calories,
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Protein (g)',
                    data: chartData.protein,
                    backgroundColor: APP_CONFIG.chartColors.protein + '80',
                    borderColor: APP_CONFIG.chartColors.protein,
                    borderWidth: 1,
                    yAxisID: 'y1'
                },
                {
                    label: 'Fiber (g)',
                    data: chartData.fiber,
                    backgroundColor: APP_CONFIG.chartColors.fiber + '80',
                    borderColor: APP_CONFIG.chartColors.fiber,
                    borderWidth: 1,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Calories'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Grams'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    });
    
    updateProgressStats();
}

function getChartData() {
    const today = new Date();
    const labels = [];
    const calories = [];
    const protein = [];
    const fiber = [];
    
    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        const totals = calculateDailyTotals(date);
        calories.push(totals.calories);
        protein.push(totals.protein);
        fiber.push(totals.fiber);
    }
    
    return { labels, calories, protein, fiber };
}

function updateProgressStats() {
    const chartData = getChartData();
    
    const avgCalories = chartData.calories.length > 0 ? 
        Math.round(chartData.calories.reduce((a, b) => a + b, 0) / chartData.calories.length) : 0;
    const avgProtein = chartData.protein.length > 0 ? 
        Math.round(chartData.protein.reduce((a, b) => a + b, 0) / chartData.protein.length) : 0;
    const avgFiber = chartData.fiber.length > 0 ? 
        Math.round(chartData.fiber.reduce((a, b) => a + b, 0) / chartData.fiber.length) : 0;
    
    const avgCaloriesEl = document.getElementById('avg-calories');
    const avgProteinEl = document.getElementById('avg-protein');
    const avgFiberEl = document.getElementById('avg-fiber');
    
    if (avgCaloriesEl) avgCaloriesEl.textContent = avgCalories;
    if (avgProteinEl) avgProteinEl.textContent = avgProtein;
    if (avgFiberEl) avgFiberEl.textContent = avgFiber;
}

function initializeProgressView() {
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            setTimeout(updateProgressChart, 100);
        });
    });
}

// Modal Functions
function initializeModal() {
    const modal = document.getElementById('add-meal-modal');
    const addMealBtn = document.getElementById('add-meal-btn');
    const closeBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-meal');
    const backdrop = document.querySelector('.modal-backdrop');
    const form = document.getElementById('add-meal-form');
    
    if (!modal || !addMealBtn || !form) {
        console.error('Modal elements not found');
        return;
    }
    
    function openModal() {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Populate with calculated nutrition if available
        if (calculatedNutrition) {
            const caloriesEl = document.getElementById('meal-calories');
            const proteinEl = document.getElementById('meal-protein');
            const carbsEl = document.getElementById('meal-carbs');
            const fatEl = document.getElementById('meal-fat');
            const fiberEl = document.getElementById('meal-fiber');
            
            if (caloriesEl) caloriesEl.value = calculatedNutrition.calories;
            if (proteinEl) proteinEl.value = calculatedNutrition.protein;
            if (carbsEl) carbsEl.value = calculatedNutrition.carbs;
            if (fatEl) fatEl.value = calculatedNutrition.fat;
            if (fiberEl) fiberEl.value = calculatedNutrition.fiber;
            
            calculatedNutrition = null;
        }
    }
    
    function closeModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        form.reset();
    }
    
    addMealBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    });
    
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal();
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal();
        });
    }
    
    if (backdrop) {
        backdrop.addEventListener('click', closeModal);
    }
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nameEl = document.getElementById('meal-name');
        const typeEl = document.getElementById('meal-type');
        const caloriesEl = document.getElementById('meal-calories');
        const proteinEl = document.getElementById('meal-protein');
        const carbsEl = document.getElementById('meal-carbs');
        const fatEl = document.getElementById('meal-fat');
        const fiberEl = document.getElementById('meal-fiber');
        
        if (!nameEl || !typeEl || !caloriesEl || !proteinEl || !carbsEl || !fatEl || !fiberEl) {
            alert('Please fill in all fields');
            return;
        }
        
        const mealData = {
            name: nameEl.value.trim(),
            type: typeEl.value,
            calories: parseInt(caloriesEl.value) || 0,
            protein: parseFloat(proteinEl.value) || 0,
            carbs: parseFloat(carbsEl.value) || 0,
            fat: parseFloat(fatEl.value) || 0,
            fiber: parseFloat(fiberEl.value) || 0
        };
        
        if (!mealData.name) {
            alert('Please enter a meal name');
            return;
        }
        
        addMeal(mealData);
        closeModal();
    });
}

// AI Calculator Functions
function initializeAICalculator() {
    const calculateBtn = document.getElementById('calculate-nutrition-btn');
    const copyBtn = document.getElementById('copy-to-meal-btn');
    const ingredientsInput = document.getElementById('ingredients-input');
    const results = document.getElementById('calculator-results');
    const loading = document.getElementById('calculator-loading');
    
    if (!calculateBtn || !ingredientsInput) {
        console.error('AI Calculator elements not found');
        return;
    }
    
    calculateBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const ingredients = ingredientsInput.value.trim();
        if (!ingredients) {
            alert('Please enter some ingredients');
            return;
        }
        
        // Show loading state
        if (results) results.classList.add('hidden');
        if (loading) loading.classList.remove('hidden');
        calculateBtn.disabled = true;
        
        try {
            const nutrition = await calculateNutrition(ingredients);
            displayNutritionResults(nutrition);
            if (results) results.classList.remove('hidden');
        } catch (error) {
            console.error('Nutrition calculation failed:', error);
            // Fallback to sample data
            const fallbackNutrition = {
                calories: 350,
                protein: 25,
                carbs: 30,
                fat: 15,
                fiber: 5
            };
            displayNutritionResults(fallbackNutrition);
            if (results) results.classList.remove('hidden');
        } finally {
            if (loading) loading.classList.add('hidden');
            calculateBtn.disabled = false;
        }
    });
    
    if (copyBtn) {
        copyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Switch to dashboard and open modal
            const dashboardTab = document.querySelector('[data-tab="dashboard"]');
            if (dashboardTab) {
                dashboardTab.click();
                setTimeout(() => {
                    const addMealBtn = document.getElementById('add-meal-btn');
                    if (addMealBtn) addMealBtn.click();
                }, 100);
            }
        });
    }
}

async function calculateNutrition(ingredients) {
    // Try to call Netlify function first, with fallback
    try {
        const response = await fetch('/.netlify/functions/calculate-nutrition', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ingredients })
        });
        
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.log('Netlify function not available, using local calculation');
    }
    
    // Fallback calculation based on common ingredients
    return calculateNutritionLocally(ingredients);
}

function calculateNutritionLocally(ingredients) {
    // Simple fallback calculation
    const lines = ingredients.toLowerCase().split('\n').filter(line => line.trim());
    let totalNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    
    const nutritionDb = {
        'chicken': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
        'bread': { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7 },
        'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
        'egg': { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
        'olive oil': { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
        'oat': { calories: 389, protein: 17, carbs: 66, fat: 7, fiber: 10.6 },
        'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
        'apple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 },
        'yogurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0 },
        'berries': { calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4 }
    };
    
    lines.forEach(line => {
        // Extract quantity and ingredient
        const match = line.match(/(\d+(?:\.\d+)?)\s*(?:cup|tbsp|oz|slice|medium|large|small)?\s*(.*)/);
        if (match) {
            const quantity = parseFloat(match[1]) || 1;
            const ingredient = match[2].trim();
            
            // Find matching ingredient in database
            const dbKey = Object.keys(nutritionDb).find(key => ingredient.includes(key));
            if (dbKey) {
                const nutrition = nutritionDb[dbKey];
                const multiplier = quantity * 0.5; // Rough portion adjustment
                
                totalNutrition.calories += nutrition.calories * multiplier;
                totalNutrition.protein += nutrition.protein * multiplier;
                totalNutrition.carbs += nutrition.carbs * multiplier;
                totalNutrition.fat += nutrition.fat * multiplier;
                totalNutrition.fiber += nutrition.fiber * multiplier;
            }
        }
    });
    
    // Add base values if nothing matched
    if (totalNutrition.calories === 0) {
        totalNutrition = {
            calories: 250,
            protein: 15,
            carbs: 30,
            fat: 8,
            fiber: 4
        };
    }
    
    // Round values
    Object.keys(totalNutrition).forEach(key => {
        totalNutrition[key] = Math.round(totalNutrition[key] * 10) / 10;
    });
    
    return totalNutrition;
}

function displayNutritionResults(nutrition) {
    const caloriesEl = document.getElementById('calc-calories');
    const proteinEl = document.getElementById('calc-protein');
    const carbsEl = document.getElementById('calc-carbs');
    const fatEl = document.getElementById('calc-fat');
    const fiberEl = document.getElementById('calc-fiber');
    
    if (caloriesEl) caloriesEl.textContent = Math.round(nutrition.calories);
    if (proteinEl) proteinEl.textContent = nutrition.protein.toFixed(1) + 'g';
    if (carbsEl) carbsEl.textContent = nutrition.carbs.toFixed(1) + 'g';
    if (fatEl) fatEl.textContent = nutrition.fat.toFixed(1) + 'g';
    if (fiberEl) fiberEl.textContent = nutrition.fiber.toFixed(1) + 'g';
    
    calculatedNutrition = nutrition;
}

// Application Initialization
function initializeApp() {
    console.log('Initializing Yumyum app...');
    
    // Initialize data
    initializeData();
    
    // Initialize UI components
    initializeNavigation();
    initializeDashboardDateNavigation();
    initializeDailyLogDateNavigation();
    initializeModal();
    initializeAICalculator();
    initializeProgressView();
    
    // Initial updates
    updateDashboard();
    updateDailyLog();
    
    console.log('Yumyum app initialized successfully!');
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}