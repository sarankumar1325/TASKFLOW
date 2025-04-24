document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const taskList = document.getElementById('taskList');
    const addTaskButton = document.getElementById('addTask');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const themeToggle = document.getElementById('themeToggle');
    const totalTasksElement = document.getElementById('totalTasks');
    const completedTasksElement = document.getElementById('completedTasks');
    const pendingTasksElement = document.getElementById('pendingTasks');
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Theme Management
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });

    // Update Statistics
    function updateStatistics() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;

        totalTasksElement.textContent = totalTasks;
        completedTasksElement.textContent = completedTasks;
        pendingTasksElement.textContent = pendingTasks;

        // Animate statistics update
        [totalTasksElement, completedTasksElement, pendingTasksElement].forEach(element => {
            element.style.animation = 'none';
            element.offsetHeight; // Trigger reflow
            element.style.animation = 'pulse 0.5s ease-in-out';
        });
    }

    // Update loadTasks function to properly handle task loading
    function loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
            // Clear existing tasks before loading
            taskList.innerHTML = '';
            // Sort tasks by creation date to maintain order
            tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .forEach(task => {
                    const taskElement = createTaskElement(task);
                    taskList.appendChild(taskElement);
                });
            updateStatistics();
        }
    }

    // Update save tasks function to ensure proper persistence
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateStatistics();
    }

    // Update delete task handler
    function deleteTask(taskElement, taskId) {
        taskElement.style.animation = 'fadeOut 0.5s ease forwards';
        setTimeout(() => {
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasks();
            taskElement.remove();
        }, 500);
    }

    function createTaskElement(task) {
        const li = document.createElement('li');
        li.dataset.category = task.category;
        if (task.completed) li.classList.add('completed');
        if (task.priority) li.classList.add(`priority-${task.priority}`);

        const categoryBadge = document.createElement('span');
        categoryBadge.className = 'category-badge';
        categoryBadge.textContent = task.category.charAt(0).toUpperCase() + task.category.slice(1);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        // Add animation when completing tasks
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                li.style.animation = 'completeTask 0.5s ease forwards';
            } else {
                li.style.animation = 'none';
                li.offsetHeight; // Trigger reflow
            }
            task.completed = checkbox.checked;
            li.classList.toggle('completed');
            saveTasks();
        });

        const prioritySelect = document.createElement('select');
        prioritySelect.className = 'priority-select';
        ['low', 'medium', 'high'].forEach(priority => {
            const option = document.createElement('option');
            option.value = priority;
            option.text = priority.charAt(0).toUpperCase() + priority.slice(1);
            if (task.priority === priority) option.selected = true;
            prioritySelect.appendChild(option);
        });
        prioritySelect.addEventListener('change', () => {
            li.className = `priority-${prioritySelect.value}`;
            if (task.completed) li.classList.add('completed');
            task.priority = prioritySelect.value;
            saveTasks();
        });

        const span = document.createElement('span');
        span.textContent = task.text;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        // Update delete button handler
        deleteBtn.addEventListener('click', () => {
            deleteTask(li, task.id);
        });

        li.appendChild(checkbox);
        li.appendChild(categoryBadge);
        li.appendChild(prioritySelect);
        li.appendChild(span);
        li.appendChild(deleteBtn);
        return li;
    }

    // Update addTask function
    function addTask(text) {
        if (text.trim() === '') return;

        const task = { 
            id: Date.now(),
            text, 
            completed: false,
            priority: 'medium',
            category: document.getElementById('taskCategory').value,
            createdAt: new Date().toISOString()
        };

        tasks.unshift(task); // Add to beginning of array
        const taskElement = createTaskElement(task);
        taskElement.style.animation = 'slideIn 0.3s ease forwards';
        
        // Add to beginning of list
        if (taskList.firstChild) {
            taskList.insertBefore(taskElement, taskList.firstChild);
        } else {
            taskList.appendChild(taskElement);
        }
        
        saveTasks();
        taskInput.value = '';
    }

    addTaskButton.addEventListener('click', () => addTask(taskInput.value));
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask(taskInput.value);
    });

    // Update Category filter functionality
    const categoryFilters = document.querySelectorAll('.filter-btn');
    categoryFilters.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state of filter buttons
            categoryFilters.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const selectedCategory = button.dataset.category;
            const tasks = document.querySelectorAll('.task-list li');

            tasks.forEach(task => {
                const taskCategory = task.dataset.category;
                
                // Reset animation
                task.style.animation = 'none';
                task.offsetHeight; // Trigger reflow

                if (selectedCategory === 'all' || taskCategory === selectedCategory) {
                    task.classList.remove('hidden');
                    task.style.animation = 'fadeIn 0.5s ease forwards';
                    task.style.display = 'flex';
                } else {
                    task.style.animation = 'fadeOut 0.3s ease forwards';
                    setTimeout(() => {
                        task.classList.add('hidden');
                        task.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Load tasks when page loads
    loadTasks();
});