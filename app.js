// File: script.js

document.addEventListener('DOMContentLoaded', () => {
    // State Management
    let state = {
        currentDate: new Date(),
        meals: JSON.parse(localStorage.getItem('yumyumMeals')) || {},
        goals: {
            calories: 1500,
            protein: 80,
            carbs: 201,
            fat: 42,
            fiber: 25
        }
    };

    // Chart instance
    let progressChart = null;

    // --- UTILITY FUNCTIONS ---
    const formatDate = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const getDateKey = (date) => {
        return date.toISOString().split('T')[0];
    };

    const saveState = () => {
        localStorage.setItem('yumyumMeals', JSON.stringify(state.meals));
    };

    // --- UI RENDERING FUNCTIONS ---
    const updateDateDisplay = () => {
        const dateDisplays = document.querySelectorAll('.current-date-display');
        dateDisplays.forEach(display => {
            if (display) {
                display.textContent = formatDate(state.currentDate);
            }
        });
    };

    const renderDashboard = () => {
        updateDateDisplay();
        const dateKey = getDateKey(state.currentDate);
        const dayMeals = state.meals[dateKey] || [];

        const totals = dayMeals.reduce((acc, meal) => {
            acc.calories += meal.calories * meal.quantity;
            acc.protein += meal.protein * meal.quantity;
            acc.carbs += meal.carbs * meal.quantity;
            acc.fat += meal.fat * meal.quantity;
            acc.fiber += meal.fiber * meal.quantity;
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

        updateProgressCircle('calories', totals.calories, state.goals.calories);
        updateProgressCircle('protein', totals.protein, state.goals.protein);
        updateProgressCircle('carbs', totals.carbs, state.goals.carbs);
        updateProgressCircle('fat', totals.fat, state.goals.fat);
        updateProgressCircle('fiber', totals.fiber, state.goals.fiber);
    };

    const updateProgressCircle = (nutrient, consumed, goal) => {
        const circle = document.getElementById(`${nutrient}-progress`);
        const remainingEl = document.getElementById(`${nutrient}-remaining`);
        if (!circle || !remainingEl) return;

        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        const progress = Math.min(consumed / goal, 1);
        const offset = circumference * (1 - progress);

        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = offset;

        const remaining = Math.max(0, goal - consumed).toFixed(0);
        remainingEl.textContent = `${remaining} ${nutrient === 'calories' ? 'kcal' : 'g'} remaining`;
    };

    const renderDailyLog = () => {
        updateDateDisplay();
        const dateKey = getDateKey(state.currentDate);
        const dayMeals = state.meals[dateKey] || [];
        const mealContainer = document.getElementById('daily-log-meals');
        if (!mealContainer) return;

        mealContainer.innerHTML = '';
        const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

        mealTypes.forEach(type => {
            const mealsOfType = dayMeals.filter(meal => meal.type === type.toLowerCase());
            if (mealsOfType.length > 0) {
                const typeSection = document.createElement('div');
                typeSection.className = 'meal-type-section';
                typeSection.innerHTML = `<h3>${type}</h3>`;
                const mealList = document.createElement('ul');

                mealsOfType.forEach(meal => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span>${meal.name} (x${meal.quantity})</span>
                        <span>${(meal.calories * meal.quantity).toFixed(0)} kcal</span>
                        <div class="meal-details">
                            Protein: ${(meal.protein * meal.quantity).toFixed(1)}g | 
                            Carbs: ${(meal.carbs * meal.quantity).toFixed(1)}g | 
                            Fat: ${(meal.fat * meal.quantity).toFixed(1)}g | 
                            Fiber: ${(meal.fiber * meal.quantity).toFixed(1)}g
                        </div>
                        <div class="meal-actions">
                            <button class="edit-meal" data-id="${meal.id}">Edit</button>
                            <button class="delete-meal" data-id="${meal.id}">Delete</button>
                        </div>
                    `;
                    mealList.appendChild(li);
                });
                typeSection.appendChild(mealList);
                mealContainer.appendChild(typeSection);
            }
        });
    };

    const renderProgress = () => {
        const allDates = Object.keys(state.meals).sort();
        if (allDates.length === 0) {
            // Handle empty state
            const chartCtx = document.getElementById('progress-chart').getContext('2d');
            if (progressChart) progressChart.destroy();
             document.getElementById('avg-calories').textContent = '0';
             document.getElementById('avg-protein').textContent = '0g';
             document.getElementById('avg-fiber').textContent = '0g';
            return;
        }

        const labels = [];
        const caloriesData = [];
        const proteinData = [];
        const fiberData = [];

        allDates.forEach(dateKey => {
            labels.push(new Date(dateKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            const dayMeals = state.meals[dateKey] || [];
            const totals = dayMeals.reduce((acc, meal) => {
                acc.calories += meal.calories * meal.quantity;
                acc.protein += meal.protein * meal.quantity;
                acc.fiber += meal.fiber * meal.quantity;
                return acc;
            }, { calories: 0, protein: 0, fiber: 0 });
            caloriesData.push(totals.calories);
            proteinData.push(totals.protein);
            fiberData.push(totals.fiber);
        });
        
        // Calculate Averages
        const avgCalories = caloriesData.reduce((a, b) => a + b, 0) / (caloriesData.length || 1);
        const avgProtein = proteinData.reduce((a, b) => a + b, 0) / (proteinData.length || 1);
        const avgFiber = fiberData.reduce((a, b) => a + b, 0) / (fiberData.length || 1);

        document.getElementById('avg-calories').textContent = avgCalories.toFixed(0);
        document.getElementById('avg-protein').textContent = `${avgProtein.toFixed(1)}g`;
        document.getElementById('avg-fiber').textContent = `${avgFiber.toFixed(1)}g`;

        const chartCtx = document.getElementById('progress-chart').getContext('2d');
        if (progressChart) {
            progressChart.destroy();
        }
        progressChart = new Chart(chartCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Calories',
                        data: caloriesData,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        yAxisID: 'y'
                    },
                    {
                        label: 'Protein',
                        data: proteinData,
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        yAxisID: 'y1'
                    },
                     {
                        label: 'Fiber',
                        data: fiberData,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        yAxisID: 'y1'
                    },
                    {
                        type: 'line',
                        label: 'Calorie Goal',
                        data: Array(labels.length).fill(state.goals.calories),
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0,
                         yAxisID: 'y'
                    },
                    {
                        type: 'line',
                        label: 'Protein Goal',
                        data: Array(labels.length).fill(state.goals.protein),
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0,
                        yAxisID: 'y1'
                    },
                    {
                        type: 'line',
                        label: 'Fiber Goal',
                        data: Array(labels.length).fill(state.goals.fiber),
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                   y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Calories (kcal)' }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: 'Grams (g)' },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });
    };

    // --- EVENT HANDLERS & LOGIC ---
    const showTab = (tabId) => {
        document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
        document.querySelectorAll('nav button').forEach(button => button.classList.remove('active'));

        document.getElementById(tabId).style.display = 'block';
        document.querySelector(`nav button[data-tab="${tabId}"]`).classList.add('active');

        switch (tabId) {
            case 'dashboard':
                renderDashboard();
                break;
            case 'daily-log':
                renderDailyLog();
                break;
            case 'progress':
                renderProgress();
                break;
        }
    };

    const handleDateChange = (days) => {
        state.currentDate.setDate(state.currentDate.getDate() + days);
        renderDashboard();
        renderDailyLog();
    };

    const handleAddMeal = (e) => {
        e.preventDefault();
        const form = e.target;
        const newMeal = {
            id: Date.now(),
            name: form.mealName.value,
            type: form.mealType.value,
            quantity: parseFloat(form.quantity.value),
            calories: parseFloat(form.calories.value),
            protein: parseFloat(form.protein.value),
            carbs: parseFloat(form.carbs.value),
            fat: parseFloat(form.fat.value),
            fiber: parseFloat(form.fiber.value)
        };

        const dateKey = getDateKey(state.currentDate);
        if (!state.meals[dateKey]) {
            state.meals[dateKey] = [];
        }
        state.meals[dateKey].push(newMeal);
        saveState();
        form.reset();
        document.getElementById('add-meal-modal').style.display = 'none';
        renderDashboard();
        renderDailyLog();
    };

    const handleDeleteMeal = (mealId) => {
        const dateKey = getDateKey(state.currentDate);
        state.meals[dateKey] = state.meals[dateKey].filter(meal => meal.id !== mealId);
        if (state.meals[dateKey].length === 0) {
            delete state.meals[dateKey];
        }
        saveState();
        renderDashboard();
        renderDailyLog();
    };

    // ** THIS IS THE UPDATED FUNCTION **
    const calculateNutrition = async () => {
        const ingredientsInput = document.getElementById('ai-ingredients');
        const resultsContainer = document.getElementById('ai-results');
        const calcBtn = document.getElementById('calculate-btn');
        const copyBtn = document.getElementById('copy-to-meal-btn');
        
        const ingredients = ingredientsInput.value.trim();
        if (!ingredients) {
            alert('Please enter some ingredients.');
            return;
        }

        calcBtn.disabled = true;
        calcBtn.innerHTML = '<span class="spinner"></span> Calculating...';
        resultsContainer.innerHTML = '';
        copyBtn.style.display = 'none';

        try {
            // Call the Netlify serverless function
            const response = await fetch('/.netlify/functions/calculate-nutrition', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ingredients: ingredients })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'The nutrition calculation failed.');
            }

            const nutrition = await response.json();
            displayNutritionResults(nutrition);

        } catch (error) {
            console.error('Error calculating nutrition:', error);
            resultsContainer.innerHTML = `<p class="error">Calculation failed. Please check your ingredients or try again later. Error: ${error.message}</p>`;
        } finally {
            calcBtn.disabled = false;
            calcBtn.textContent = 'Calculate Nutrition';
        }
    };
    
    const displayNutritionResults = (nutrition) => {
        const resultsContainer = document.getElementById('ai-results');
        resultsContainer.innerHTML = `
            <div class="nutrient-card"><strong>Calories:</strong> <span>${nutrition.calories.toFixed(0)}</span></div>
            <div class="nutrient-card"><strong>Protein:</strong> <span>${nutrition.protein.toFixed(1)}g</span></div>
            <div class="nutrient-card"><strong>Carbs:</strong> <span>${nutrition.carbs.toFixed(1)}g</span></div>
            <div class="nutrient-card"><strong>Fat:</strong> <span>${nutrition.fat.toFixed(1)}g</span></div>
            <div class="nutrient-card"><strong>Fiber:</strong> <span>${nutrition.fiber.toFixed(1)}g</span></div>
        `;
        const copyBtn = document.getElementById('copy-to-meal-btn');
        copyBtn.style.display = 'block';
        copyBtn.dataset.nutrition = JSON.stringify(nutrition);
    };

    const copyNutritionToForm = (e) => {
        const nutrition = JSON.parse(e.target.dataset.nutrition);
        const form = document.getElementById('add-meal-form');
        
        form.calories.value = nutrition.calories.toFixed(0);
        form.protein.value = nutrition.protein.toFixed(1);
        form.carbs.value = nutrition.carbs.toFixed(1);
        form.fat.value = nutrition.fat.toFixed(1);
        form.fiber.value = nutrition.fiber.toFixed(1);
        form.quantity.value = 1;

        showTab('dashboard'); // Switch to a tab where the modal can be opened
        document.getElementById('add-meal-modal').style.display = 'flex';
        alert('Nutrition details copied to the "Add Meal" form!');
    };


    // --- EVENT LISTENERS ---
    document.querySelector('nav').addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            showTab(e.target.dataset.tab);
        }
    });

    document.querySelectorAll('.date-nav').forEach(nav => {
        nav.addEventListener('click', (e) => {
            if (e.target.closest('.prev-day')) handleDateChange(-1);
            if (e.target.closest('.next-day')) handleDateChange(1);
        });
    });

    document.getElementById('add-meal-btn').addEventListener('click', () => {
        document.getElementById('add-meal-modal').style.display = 'flex';
    });

    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('add-meal-modal').style.display = 'none';
    });

    document.getElementById('add-meal-form').addEventListener('submit', handleAddMeal);
    
    document.getElementById('daily-log-meals').addEventListener('click', (e) => {
        if(e.target.classList.contains('delete-meal')) {
            const mealId = parseInt(e.target.dataset.id);
            if(confirm('Are you sure you want to delete this meal?')) {
                handleDeleteMeal(mealId);
            }
        }
        // Add edit functionality here if needed
    });

    document.getElementById('calculate-btn').addEventListener('click', calculateNutrition);
    document.getElementById('copy-to-meal-btn').addEventListener('click', copyNutritionToForm);


    // Initial Load
    showTab('dashboard');
});
