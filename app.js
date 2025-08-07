// Yumyum Nutrition Tracking App
class NutritionTracker {
    constructor() {
        this.currentDate = new Date().toISOString().split('T')[0];
        this.dailyGoals = {
            calories: 1500,
            protein: 80,
            carbs: 201,
            fat: 42,
            fiber: 25
        };
        
        this.editingMealId = null;
        this.progressChart = null;
        this.currentView = 'monthly';
        this.visibleNutrients = {
            calories: true,
            protein: true,
            fiber: true
        };
        
        this.init();
    }

    init() {
        this.loadSampleData();
        this.bindEvents();
        this.updateDateDisplay();
        this.updateDashboard();
        this.updateMealsView();
        // Delay chart initialization to ensure DOM is ready
        setTimeout(() => {
            this.updateProgressChart();
            this.updateStats();
        }, 100);
    }

    loadSampleData() {
        const existingMeals = this.getMeals();
        if (existingMeals.length === 0) {
            const sampleMeals = [
                {
                    id: 1,
                    name: "Oatmeal with Berries",
                    type: "breakfast",
                    calories: 320,
                    protein: 12,
                    carbs: 58,
                    fat: 6,
                    fiber: 8,
                    date: "2025-08-07"
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
                    date: "2025-08-07"
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
                    date: "2025-08-06"
                },
                {
                    id: 4,
                    name: "Salmon Dinner",
                    type: "dinner",
                    calories: 550,
                    protein: 45,
                    carbs: 30,
                    fat: 25,
                    fiber: 6,
                    date: "2025-08-06"
                },
                {
                    id: 5,
                    name: "Morning Smoothie",
                    type: "breakfast",
                    calories: 280,
                    protein: 18,
                    carbs: 45,
                    fat: 8,
                    fiber: 12,
                    date: "2025-08-05"
                },
                {
                    id: 6,
                    name: "Protein Bar",
                    type: "snack",
                    calories: 200,
                    protein: 15,
                    carbs: 20,
                    fat: 7,
                    fiber: 5,
                    date: "2025-08-04"
                },
                {
                    id: 7,
                    name: "Quinoa Bowl",
                    type: "lunch",
                    calories: 400,
                    protein: 22,
                    carbs: 55,
                    fat: 12,
                    fiber: 10,
                    date: "2025-08-03"
                },
                {
                    id: 8,
                    name: "Avocado Toast",
                    type: "breakfast",
                    calories: 350,
                    protein: 10,
                    carbs: 30,
                    fat: 20,
                    fiber: 8,
                    date: "2025-08-02"
                }
            ];
            this.saveMeals(sampleMeals);
        }
    }

    bindEvents() {
        // Navigation tabs
        document.querySelectorAll('.nav__tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const tabName = tab.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });

        // Date navigation for Dashboard
        this.bindDateNavigation();
        
        // Add meal buttons
        this.bindAddMealButtons();

        // Modal events
        this.bindModalEvents();

        // Progress view toggles
        this.bindProgressControls();

        // Nutrient toggle buttons
        this.bindNutrientToggles();

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMealModal();
            }
        });
    }

    bindDateNavigation() {
        const prevBtn = document.getElementById('prevDay');
        const nextBtn = document.getElementById('nextDay');
        const prevBtnLog = document.getElementById('prevDayLog');
        const nextBtnLog = document.getElementById('nextDayLog');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.changeDate(-1);
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.changeDate(1);
            });
        }

        if (prevBtnLog) {
            prevBtnLog.addEventListener('click', (e) => {
                e.preventDefault();
                this.changeDate(-1);
            });
        }
        
        if (nextBtnLog) {
            nextBtnLog.addEventListener('click', (e) => {
                e.preventDefault();
                this.changeDate(1);
            });
        }
    }

    bindAddMealButtons() {
        const addMealBtn = document.getElementById('addMealBtn');
        const addMealBtnLog = document.getElementById('addMealBtnLog');
        
        if (addMealBtn) {
            addMealBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openMealModal();
            });
        }
        
        if (addMealBtnLog) {
            addMealBtnLog.addEventListener('click', (e) => {
                e.preventDefault();
                this.openMealModal();
            });
        }
    }

    bindModalEvents() {
        const modalClose = document.getElementById('modalClose');
        const modalBackdrop = document.getElementById('modalBackdrop');
        const cancelBtn = document.getElementById('cancelBtn');
        const mealForm = document.getElementById('mealForm');

        if (modalClose) {
            modalClose.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeMealModal();
            });
        }
        
        if (modalBackdrop) {
            modalBackdrop.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeMealModal();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeMealModal();
            });
        }
        
        if (mealForm) {
            mealForm.addEventListener('submit', (e) => {
                this.handleMealSubmit(e);
            });
        }
    }

    bindProgressControls() {
        const weeklyView = document.getElementById('weeklyView');
        const monthlyView = document.getElementById('monthlyView');
        
        if (weeklyView) {
            weeklyView.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchProgressView('weekly');
            });
        }
        
        if (monthlyView) {
            monthlyView.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchProgressView('monthly');
            });
        }
    }

    bindNutrientToggles() {
        document.querySelectorAll('.nutrient-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const nutrient = toggle.getAttribute('data-nutrient');
                this.toggleNutrient(nutrient);
            });
        });
    }

    toggleNutrient(nutrient) {
        this.visibleNutrients[nutrient] = !this.visibleNutrients[nutrient];
        
        const toggle = document.querySelector(`[data-nutrient="${nutrient}"]`);
        if (toggle) {
            toggle.classList.toggle('nutrient-toggle--active', this.visibleNutrients[nutrient]);
        }
        
        this.updateProgressChart();
    }

    switchTab(tabName) {
        // Update nav tabs active state
        document.querySelectorAll('.nav__tab').forEach(tab => {
            if (tab.getAttribute('data-tab') === tabName) {
                tab.classList.add('nav__tab--active');
            } else {
                tab.classList.remove('nav__tab--active');
            }
        });

        // Update tab content visibility
        document.querySelectorAll('.tab-content').forEach(content => {
            if (content.id === tabName) {
                content.classList.add('tab-content--active');
            } else {
                content.classList.remove('tab-content--active');
            }
        });

        // Update data when switching to specific tabs
        if (tabName === 'meals') {
            this.updateMealsView();
        } else if (tabName === 'progress') {
            // Delay to ensure tab content is visible
            setTimeout(() => {
                this.updateProgressChart();
                this.updateStats();
            }, 50);
        }
    }

    changeDate(days) {
        const date = new Date(this.currentDate);
        date.setDate(date.getDate() + days);
        this.currentDate = date.toISOString().split('T')[0];
        this.updateDateDisplay();
        this.updateDashboard();
        this.updateMealsView();
    }

    updateDateDisplay() {
        const date = new Date(this.currentDate);
        const today = new Date().toISOString().split('T')[0];
        
        let displayText;
        if (this.currentDate === today) {
            displayText = 'Today';
        } else {
            displayText = date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
            });
        }
        
        const currentDateEl = document.getElementById('currentDate');
        const currentDateLogEl = document.getElementById('currentDateLog');
        const mealsDateEl = document.getElementById('mealsDate');
        
        if (currentDateEl) {
            currentDateEl.textContent = displayText;
        }
        if (currentDateLogEl) {
            currentDateLogEl.textContent = displayText;
        }
        if (mealsDateEl) {
            mealsDateEl.textContent = `${displayText}'s Meals`;
        }
    }

    getMeals() {
        try {
            return JSON.parse(localStorage.getItem('nutritionMeals') || '[]');
        } catch (e) {
            console.error('Error loading meals:', e);
            return [];
        }
    }

    saveMeals(meals) {
        try {
            localStorage.setItem('nutritionMeals', JSON.stringify(meals));
        } catch (e) {
            console.error('Error saving meals:', e);
        }
    }

    getMealsForDate(date) {
        return this.getMeals().filter(meal => meal.date === date);
    }

    getTotalNutrition(date) {
        const meals = this.getMealsForDate(date);
        return meals.reduce((totals, meal) => {
            totals.calories += meal.calories || 0;
            totals.protein += meal.protein || 0;
            totals.carbs += meal.carbs || 0;
            totals.fat += meal.fat || 0;
            totals.fiber += meal.fiber || 0;
            return totals;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
    }

    updateDashboard() {
        const totals = this.getTotalNutrition(this.currentDate);
        
        Object.keys(this.dailyGoals).forEach(nutrient => {
            const current = totals[nutrient] || 0;
            const goal = this.dailyGoals[nutrient];
            const remaining = Math.max(0, goal - current);
            const percentage = Math.min(100, (current / goal) * 100);
            
            const circle = document.querySelector(`[data-nutrition="${nutrient}"]`);
            if (circle) {
                const currentSpan = circle.querySelector('.current');
                const goalSpan = circle.querySelector('.goal');
                const remainingP = circle.parentElement.querySelector('.remaining');
                
                if (currentSpan) currentSpan.textContent = Math.round(current);
                if (goalSpan) goalSpan.textContent = goal;
                
                const unit = nutrient === 'calories' ? '' : 'g';
                if (remainingP) {
                    remainingP.textContent = `${Math.round(remaining)}${unit} remaining`;
                }
                
                this.updateProgressCircle(circle, percentage, current, goal);
            }
        });
    }

    updateProgressCircle(circle, percentage, current, goal) {
        const degrees = (percentage / 100) * 360;
        let color = '#1FB8CD';
        
        if (current > goal) {
            color = '#FF5459';
        } else if (percentage > 90) {
            color = '#E6816B';
        } else {
            color = '#1FB8CD';
        }
        
        circle.style.background = `conic-gradient(${color} ${degrees}deg, var(--color-secondary) ${degrees}deg)`;
    }

    updateMealsView() {
        const meals = this.getMealsForDate(this.currentDate);
        const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
        
        mealTypes.forEach(type => {
            const section = document.querySelector(`[data-meal-type="${type}"] .meal-items`);
            if (section) {
                const typeMeals = meals.filter(meal => meal.type === type);
                
                if (typeMeals.length === 0) {
                    section.innerHTML = '<div class="empty-meal">No meals added yet</div>';
                } else {
                    section.innerHTML = typeMeals.map(meal => this.createMealItemHTML(meal)).join('');
                }
            }
        });
        
        this.bindMealActions();
    }

    createMealItemHTML(meal) {
        return `
            <div class="meal-item">
                <div class="meal-item__info">
                    <h4>${meal.name}</h4>
                    <div class="meal-item__nutrition">
                        <span>${meal.calories} kcal</span>
                        <span>P: ${meal.protein}g</span>
                        <span>C: ${meal.carbs}g</span>
                        <span>F: ${meal.fat}g</span>
                        <span>Fiber: ${meal.fiber}g</span>
                    </div>
                </div>
                <div class="meal-item__actions">
                    <button class="edit-btn" data-meal-id="${meal.id}">Edit</button>
                    <button class="delete-btn" data-meal-id="${meal.id}">Delete</button>
                </div>
            </div>
        `;
    }

    bindMealActions() {
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mealId = parseInt(e.target.dataset.mealId);
                this.editMeal(mealId);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mealId = parseInt(e.target.dataset.mealId);
                this.deleteMeal(mealId);
            });
        });
    }

    openMealModal() {
        const modal = document.getElementById('mealModal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            this.resetMealForm();
        }
    }

    closeMealModal() {
        const modal = document.getElementById('mealModal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
            this.editingMealId = null;
        }
    }

    resetMealForm() {
        const form = document.getElementById('mealForm');
        const modalTitle = document.getElementById('modalTitle');
        const saveBtn = document.getElementById('saveBtn');
        
        if (form) form.reset();
        if (modalTitle) {
            modalTitle.textContent = this.editingMealId ? 'Edit Meal' : 'Add Meal';
        }
        if (saveBtn) {
            saveBtn.textContent = this.editingMealId ? 'Update Meal' : 'Save Meal';
        }
    }

    editMeal(mealId) {
        const meals = this.getMeals();
        const meal = meals.find(m => m.id === mealId);
        if (!meal) return;

        this.editingMealId = mealId;
        
        document.getElementById('mealName').value = meal.name;
        document.getElementById('mealType').value = meal.type;
        document.getElementById('calories').value = meal.calories;
        document.getElementById('protein').value = meal.protein;
        document.getElementById('carbs').value = meal.carbs;
        document.getElementById('fat').value = meal.fat;
        document.getElementById('fiber').value = meal.fiber;
        
        this.openMealModal();
    }

    deleteMeal(mealId) {
        if (!confirm('Are you sure you want to delete this meal?')) return;
        
        const meals = this.getMeals();
        const updatedMeals = meals.filter(meal => meal.id !== mealId);
        this.saveMeals(updatedMeals);
        
        this.updateDashboard();
        this.updateMealsView();
    }

    handleMealSubmit(e) {
        e.preventDefault();
        
        const mealData = {
            name: document.getElementById('mealName').value,
            type: document.getElementById('mealType').value,
            calories: parseFloat(document.getElementById('calories').value) || 0,
            protein: parseFloat(document.getElementById('protein').value) || 0,
            carbs: parseFloat(document.getElementById('carbs').value) || 0,
            fat: parseFloat(document.getElementById('fat').value) || 0,
            fiber: parseFloat(document.getElementById('fiber').value) || 0,
            date: this.currentDate
        };

        const meals = this.getMeals();
        
        if (this.editingMealId) {
            const index = meals.findIndex(meal => meal.id === this.editingMealId);
            if (index !== -1) {
                meals[index] = { ...meals[index], ...mealData };
            }
        } else {
            mealData.id = Date.now();
            meals.push(mealData);
        }
        
        this.saveMeals(meals);
        this.closeMealModal();
        this.updateDashboard();
        this.updateMealsView();
    }

    switchProgressView(view) {
        this.currentView = view;
        
        const weeklyBtn = document.getElementById('weeklyView');
        const monthlyBtn = document.getElementById('monthlyView');
        
        if (weeklyBtn && monthlyBtn) {
            weeklyBtn.classList.toggle('btn--active', view === 'weekly');
            monthlyBtn.classList.toggle('btn--active', view === 'monthly');
        }
        
        this.updateProgressChart();
        this.updateStats();
    }

    updateProgressChart() {
        const canvas = document.getElementById('progressChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (this.progressChart) {
            this.progressChart.destroy();
            this.progressChart = null;
        }
        
        const chartData = this.getChartData();
        const datasets = [];

        // Add column datasets for visible nutrients
        if (this.visibleNutrients.calories) {
            datasets.push({
                type: 'bar',
                label: 'Calories',
                data: chartData.calories,
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: '#3B82F6',
                borderWidth: 1,
                yAxisID: 'y'
            });
            
            // Add goal line for calories
            datasets.push({
                type: 'line',
                label: 'Calorie Goal (1500)',
                data: new Array(chartData.labels.length).fill(1500),
                borderColor: '#3B82F6',
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [8, 4],
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 0,
                yAxisID: 'y',
                tension: 0
            });
        }

        if (this.visibleNutrients.protein) {
            datasets.push({
                type: 'bar',
                label: 'Protein',
                data: chartData.protein,
                backgroundColor: 'rgba(239, 68, 68, 0.7)',
                borderColor: '#EF4444',
                borderWidth: 1,
                yAxisID: 'y1'
            });
            
            // Add goal line for protein
            datasets.push({
                type: 'line',
                label: 'Protein Goal (80g)',
                data: new Array(chartData.labels.length).fill(80),
                borderColor: '#EF4444',
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [8, 4],
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 0,
                yAxisID: 'y1',
                tension: 0
            });
        }

        if (this.visibleNutrients.fiber) {
            datasets.push({
                type: 'bar',
                label: 'Fiber',
                data: chartData.fiber,
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: '#10B981',
                borderWidth: 1,
                yAxisID: 'y1'
            });
            
            // Add goal line for fiber
            datasets.push({
                type: 'line',
                label: 'Fiber Goal (25g)',
                data: new Array(chartData.labels.length).fill(25),
                borderColor: '#10B981',
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [8, 4],
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 0,
                yAxisID: 'y1',
                tension: 0
            });
        }
        
        this.progressChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim(),
                            font: {
                                family: 'Montserrat'
                            }
                        }
                    },
                    tooltip: {
                        titleFont: {
                            family: 'Montserrat'
                        },
                        bodyFont: {
                            family: 'Montserrat'
                        },
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    if (label.includes('Calories') || label.includes('Calorie')) {
                                        label += context.parsed.y + ' kcal';
                                    } else {
                                        label += context.parsed.y + 'g';
                                    }
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(94, 82, 64, 0.1)'
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim(),
                            font: {
                                family: 'Montserrat'
                            }
                        }
                    },
                    y: {
                        type: 'linear',
                        display: this.visibleNutrients.calories,
                        position: 'left',
                        beginAtZero: true,
                        title: {
                            display: this.visibleNutrients.calories,
                            text: 'Calories',
                            color: '#3B82F6',
                            font: {
                                family: 'Montserrat',
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(94, 82, 64, 0.1)'
                        },
                        ticks: {
                            color: '#3B82F6',
                            font: {
                                family: 'Montserrat'
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: this.visibleNutrients.protein || this.visibleNutrients.fiber,
                        position: 'right',
                        beginAtZero: true,
                        title: {
                            display: this.visibleNutrients.protein || this.visibleNutrients.fiber,
                            text: 'Grams',
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim(),
                            font: {
                                family: 'Montserrat',
                                weight: 'bold'
                            }
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim(),
                            font: {
                                family: 'Montserrat'
                            }
                        }
                    }
                }
            }
        });
    }

    getChartData() {
        const meals = this.getMeals();
        const dates = this.getDateRange();
        
        const labels = [];
        const calories = [];
        const protein = [];
        const fiber = [];
        
        dates.forEach(date => {
            const dayMeals = meals.filter(meal => meal.date === date);
            const totals = dayMeals.reduce((acc, meal) => {
                acc.calories += meal.calories || 0;
                acc.protein += meal.protein || 0;
                acc.fiber += meal.fiber || 0;
                return acc;
            }, { calories: 0, protein: 0, fiber: 0 });
            
            labels.push(new Date(date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            }));
            calories.push(totals.calories);
            protein.push(totals.protein);
            fiber.push(totals.fiber);
        });
        
        return { labels, calories, protein, fiber };
    }

    getDateRange() {
        const dates = [];
        const today = new Date();
        const days = this.currentView === 'weekly' ? 7 : 30;
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);
        }
        
        return dates;
    }

    updateStats() {
        const meals = this.getMeals();
        const dates = this.getDateRange();
        
        // Calculate averages for the current time period
        let totalCalories = 0;
        let totalProtein = 0;
        let totalFiber = 0;
        let daysWithData = 0;
        
        dates.forEach(date => {
            const dayTotal = this.getTotalNutrition(date);
            if (dayTotal.calories > 0 || dayTotal.protein > 0 || dayTotal.fiber > 0) {
                totalCalories += dayTotal.calories;
                totalProtein += dayTotal.protein;
                totalFiber += dayTotal.fiber;
                daysWithData++;
            }
        });
        
        const avgCaloriesEl = document.getElementById('avgCalories');
        const avgProteinEl = document.getElementById('avgProtein');
        const avgFiberEl = document.getElementById('avgFiber');
        
        if (avgCaloriesEl) {
            if (daysWithData > 0) {
                const avgCalories = Math.round(totalCalories / daysWithData);
                avgCaloriesEl.textContent = `${avgCalories} kcal`;
            } else {
                avgCaloriesEl.textContent = '0 kcal';
            }
        }
        
        if (avgProteinEl) {
            if (daysWithData > 0) {
                const avgProtein = Math.round(totalProtein / daysWithData);
                avgProteinEl.textContent = `${avgProtein}g`;
            } else {
                avgProteinEl.textContent = '0g';
            }
        }
        
        if (avgFiberEl) {
            if (daysWithData > 0) {
                const avgFiber = Math.round(totalFiber / daysWithData);
                avgFiberEl.textContent = `${avgFiber}g`;
            } else {
                avgFiberEl.textContent = '0g';
            }
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.nutritionApp = new NutritionTracker();
});