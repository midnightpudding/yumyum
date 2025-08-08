// Application state
let currentDate = new Date();
let meals = [];
let progressChart = null;
let calculatedNutrition = null;

// App Configuration
const APP_CONFIG = {
    dailyGoals: {
        calories: 1500,
        protein: 80,
        carbs: 201,
        fat: 42,
        fiber: 25
    },
    tealColors: {
        calories: '#407E8B',
        protein: '#5A9CAB', 
        carbs: '#4A8B98',
        fat: '#6BAFBF',
        fiber: '#10B981'
    },
    chartColors: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'],
    mealTypes: ['breakfast', 'lunch', 'dinner', 'snack']
};

// Sample data
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
    }
];

// Utility functions
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

function getMealsForDate(date) {
    const dateStr = dateToString(date);
    return meals.filter(meal => meal.date === dateStr);
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

// CRITICAL: Navigation functionality - this is the main issue to fix
function initializeNavigation() {
    console.log('Initializing navigation...');
    
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    console.log('Found nav tabs:', navTabs.length);
    console.log('Found tab contents:', tabContents.length);
    
    // Remove any existing event listeners and add new ones
    navTabs.forEach(tab => {
        // Clone node to remove all event listeners
        const newTab = tab.cloneNode(true);
        tab.parentNode.replaceChild(newTab, tab);
    });
    
    // Get the new tabs after cloning
    const freshNavTabs = document.querySelectorAll('.nav-tab');
    
    freshNavTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const targetTab = this.getAttribute('data-tab');
            console.log('Tab clicked:', targetTab);
            
            // Update active nav tab
            freshNavTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update active content
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
                console.log('Activated content for:', targetTab);
                
                // Initialize tab-specific functionality
                if (targetTab === 'progress') {
                    setTimeout(() => {
                        initializeProgressChart();
                    }, 100);
                } else if (targetTab === 'dashboard') {
                    updateNutritionDisplay();
                } else if (targetTab === 'daily-log') {
                    updateDailyLogDisplay();
                }
            } else {
                console.error('Target content not found:', targetTab);
            }
        });
    });
    
    console.log('Navigation initialized successfully');
}

// Dashboard functionality
function updateNutritionDisplay() {
    const totals = calculateDailyTotals(currentDate);
    
    // Update date display
    const dateEl = document.getElementById('current-date-dashboard');
    if (dateEl) {
        dateEl.textContent = formatDate(currentDate);
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

// Daily Log functionality
function updateDailyLogDisplay() {
    const dailyMeals = getMealsForDate(currentDate);
    
    // Update date display
    const dateEl = document.getElementById('current-date-log');
    if (dateEl) {
        dateEl.textContent = formatDate(currentDate);
    }
    
    // Clear existing meals and show sample data for demo
    APP_CONFIG.mealTypes.forEach(type => {
        const container = document.getElementById(`${type}-meals`);
        if (container) {
            container.innerHTML = '';
            
            // Show sample meals for breakfast and lunch
            if (type === 'breakfast' || type === 'lunch') {
                const sampleMeal = SAMPLE_MEALS.find(meal => meal.type === type);
                if (sampleMeal) {
                    container.appendChild(createMealElement(sampleMeal));
                }
            } else {
                // Show empty state for dinner and snacks
                const emptyState = document.createElement('div');
                emptyState.className = 'empty-state';
                emptyState.textContent = `No ${type} logged yet`;
                container.appendChild(emptyState);
            }
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

// Progress Chart functionality
function initializeProgressChart() {
    const canvas = document.getElementById('progress-chart');
    if (!canvas) {
        console.log('Progress chart canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    if (progressChart) {
        progressChart.destroy();
    }
    
    // Sample data for demonstration
    const labels = ['Aug 2', 'Aug 3', 'Aug 4', 'Aug 5', 'Aug 6', 'Aug 7', 'Aug 8'];
    const caloriesData = [320, 450, 380, 520, 290, 410, 770];
    const proteinData = [12, 35, 18, 42, 15, 28, 47];
    const fiberData = [8, 12, 6, 15, 4, 10, 20];
    
    progressChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Calories',
                    data: caloriesData,
                    backgroundColor: APP_CONFIG.chartColors[0] + '80',
                    borderColor: APP_CONFIG.chartColors[0],
                    borderWidth: 2,
                    yAxisID: 'y'
                },
                {
                    label: 'Protein (g)',
                    data: proteinData,
                    backgroundColor: APP_CONFIG.chartColors[1] + '80', 
                    borderColor: APP_CONFIG.chartColors[1],
                    borderWidth: 2,
                    yAxisID: 'y1'
                },
                {
                    label: 'Fiber (g)',
                    data: fiberData,
                    backgroundColor: APP_CONFIG.chartColors[2] + '80',
                    borderColor: APP_CONFIG.chartColors[2], 
                    borderWidth: 2,
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
    
    console.log('Progress chart initialized');
}

// Date navigation functionality
function initializeDateNavigation() {
    // Dashboard date navigation
    const prevDashboard = document.getElementById('prev-date-dashboard');
    const nextDashboard = document.getElementById('next-date-dashboard');
    
    if (prevDashboard) {
        prevDashboard.addEventListener('click', (e) => {
            e.preventDefault();
            currentDate.setDate(currentDate.getDate() - 1);
            updateNutritionDisplay();
        });
    }
    
    if (nextDashboard) {
        nextDashboard.addEventListener('click', (e) => {
            e.preventDefault();
            currentDate.setDate(currentDate.getDate() + 1);
            updateNutritionDisplay();
        });
    }
    
    // Daily log date navigation
    const prevLog = document.getElementById('prev-date-log');
    const nextLog = document.getElementById('next-date-log');
    
    if (prevLog) {
        prevLog.addEventListener('click', (e) => {
            e.preventDefault();
            currentDate.setDate(currentDate.getDate() - 1);
            updateDailyLogDisplay();
            updateNutritionDisplay();
        });
    }
    
    if (nextLog) {
        nextLog.addEventListener('click', (e) => {
            e.preventDefault();
            currentDate.setDate(currentDate.getDate() + 1);
            updateDailyLogDisplay();
            updateNutritionDisplay();
        });
    }
}

// Modal functionality
function initializeModal() {
    const modal = document.getElementById('add-meal-modal');
    const addMealBtn = document.getElementById('add-meal-btn');
    const addMealBtnLog = document.getElementById('add-meal-btn-log');
    const closeBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-meal');
    const backdrop = document.querySelector('.modal-backdrop');
    const form = document.getElementById('add-meal-form');
    
    if (!modal || !form) {
        console.error('Modal elements not found');
        return;
    }
    
    function openModal() {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        form.reset();
    }
    
    // Add meal buttons
    if (addMealBtn) {
        addMealBtn.addEventListener('click', openModal);
    }
    if (addMealBtnLog) {
        addMealBtnLog.addEventListener('click', openModal);
    }
    
    // Close buttons
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    if (backdrop) {
        backdrop.addEventListener('click', closeModal);
    }
    
    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const mealName = document.getElementById('meal-name')?.value?.trim();
        const mealType = document.getElementById('meal-type')?.value;
        const calories = parseInt(document.getElementById('meal-calories')?.value) || 0;
        const protein = parseFloat(document.getElementById('meal-protein')?.value) || 0;
        const carbs = parseFloat(document.getElementById('meal-carbs')?.value) || 0;
        const fat = parseFloat(document.getElementById('meal-fat')?.value) || 0;
        const fiber = parseFloat(document.getElementById('meal-fiber')?.value) || 0;
        
        if (!mealName) {
            alert('Please enter a meal name');
            return;
        }
        
        const newMeal = {
            id: Date.now(),
            name: mealName,
            type: mealType,
            calories: calories,
            protein: protein,
            carbs: carbs,
            fat: fat,
            fiber: fiber,
            date: dateToString(currentDate)
        };
        
        meals.push(newMeal);
        updateNutritionDisplay();
        updateDailyLogDisplay();
        closeModal();
        
        alert('Meal added successfully!');
    });
}

// AI Calculator functionality
function initializeAICalculator() {
    const calculateBtn = document.getElementById('calculate-nutrition-btn');
    const copyBtn = document.getElementById('copy-to-meal-btn');
    const ingredientsInput = document.getElementById('ingredients-input');
    const results = document.getElementById('calculator-results');
    const loading = document.getElementById('calculator-loading');
    
    if (!calculateBtn || !ingredientsInput) return;
    
    calculateBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const ingredients = ingredientsInput.value.trim();
        if (!ingredients) {
            alert('Please enter some ingredients');
            return;
        }
        
        // Show loading
        if (results) results.classList.add('hidden');
        if (loading) loading.classList.remove('hidden');
        calculateBtn.disabled = true;
        
        // Simulate calculation
        setTimeout(() => {
            const nutrition = {
                calories: 350,
                protein: 25,
                carbs: 30, 
                fat: 15,
                fiber: 8
            };
            
            displayNutritionResults(nutrition);
            
            if (results) results.classList.remove('hidden');
            if (loading) loading.classList.add('hidden');
            calculateBtn.disabled = false;
        }, 2000);
    });
    
    if (copyBtn) {
        copyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Switch to dashboard tab
            const dashboardTab = document.querySelector('[data-tab="dashboard"]');
            if (dashboardTab) {
                dashboardTab.click();
                
                setTimeout(() => {
                    const addMealBtn = document.getElementById('add-meal-btn');
                    if (addMealBtn) {
                        addMealBtn.click();
                        
                        // Populate form with calculated nutrition
                        if (calculatedNutrition) {
                            setTimeout(() => {
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
                            }, 100);
                        }
                    }
                }, 100);
            }
        });
    }
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

// Progress view switching
function initializeProgressView() {
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Re-initialize chart with new data
            setTimeout(initializeProgressChart, 100);
        });
    });
}

// Data management
function deleteMeal(mealId) {
    meals = meals.filter(meal => meal.id !== mealId);
    updateNutritionDisplay();
    updateDailyLogDisplay();
}

// Application initialization
function initializeApp() {
    console.log('=== Initializing Yumyum App ===');
    
    // Initialize sample data
    meals = [...SAMPLE_MEALS];
    
    try {
        // Initialize navigation FIRST and MOST IMPORTANTLY
        initializeNavigation();
        
        // Initialize other components
        initializeDateNavigation();
        initializeModal();
        initializeAICalculator();
        initializeProgressView();
        
        // Initialize displays
        updateNutritionDisplay();
        updateDailyLogDisplay();
        
        console.log('=== App initialized successfully ===');
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Start the application
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}