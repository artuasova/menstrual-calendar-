// Инициализация приложения
document.addEventListener('DOMContentLoaded', async () => {
    // Регистрация Service Worker
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('Service Worker зарегистрирован:', registration);
        } catch (error) {
            console.error('Ошибка регистрации Service Worker:', error);
        }
    }

    // Запрос разрешения на уведомления
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Уведомления разрешены');
            }
        });
    }

    // Инициализация Supabase
    await initializeApp();

    // Обработчики событий
    document.getElementById('loginBtn').addEventListener('click', login);
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('addCycleBtn').addEventListener('click', showAddCycleModal);
    document.getElementById('symptomForm').addEventListener('submit', addSymptom);

    // Отображение календаря
    renderCalendar(new Date());
});

// Инициализация приложения
async function initializeApp() {
    const { data: { session } } = await supabase.auth.getSession();
    updateAuthUI(session);
    
    if (session) {
        loadUserData();
    }
}

// Обновление UI авторизации
function updateAuthUI(session) {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (session) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
    } else {
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
    }
}

// Вход через OAuth
async function login() {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin
        }
    });
    
    if (error) {
        console.error('Ошибка входа:', error);
    }
}

// Выход
async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Ошибка выхода:', error);
    } else {
        updateAuthUI(null);
        location.reload();
    }
}

// Загрузка пользовательских данных
async function loadUserData() {
    await loadCycles();
    await loadSymptoms();
    renderChart();
}

// Рендер календаря
function renderCalendar(date) {
    const calendarEl = document.getElementById('calendar');
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Получаем первый день месяца и количество дней
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Создаем заголовок календаря
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                       'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    
    let html = `<h3>${monthNames[month]} ${year}</h3>`;
    html += '<div class="calendar-grid">';
    
    // Дни недели
    const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    weekdays.forEach(day => {
        html += `<div class="calendar-header">${day}</div>`;
    });
    
    // Пустые дни в начале месяца
    const startDay = firstDay.getDay() || 7; // Воскресенье = 0, делаем 7
    for (let i = 1; i < startDay; i++) {
        html += '<div class="calendar-day"></div>';
    }
    
    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const dateStr = formatDate(currentDate);
        html += `<div class="calendar-day" data-date="${dateStr}">${day}</div>`;
    }
    
    html += '</div>';
    calendarEl.innerHTML = html;
    
    // Добавляем обработчики кликов
    document.querySelectorAll('.calendar-day[data-date]').forEach(el => {
        el.addEventListener('click', () => showDayModal(el.dataset.date));
    });
}

// Форматирование даты
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

// Показ модального окна для дня
function showDayModal(date) {
    // Здесь можно реализовать модальное окно для добавления/редактирования данных дня
    alert(`Выбрана дата: ${date}\nЗдесь будет форма для добавления данных`);
}

// Показ модального окна для добавления цикла
function showAddCycleModal() {
    // Здесь можно реализовать модальное окно для добавления цикла
    alert('Здесь будет форма для добавления цикла');
}

// Добавление симптома
async function addSymptom(e) {
    e.preventDefault();
    
    const date = document.getElementById('symptomDate').value;
    const type = document.getElementById('symptomType').value;
    const intensity = document.getElementById('symptomIntensity').value;
    
    if (!date || !intensity) {
        alert('Заполните все поля');
        return;
    }
    
    const { data, error } = await supabase
        .from('symptoms')
        .insert([{ date, type, intensity: parseInt(intensity) }]);
    
    if (error) {
        console.error('Ошибка добавления симптома:', error);
        alert('Ошибка добавления симптома');
    } else {
        document.getElementById('symptomForm').reset();
        loadSymptoms();
        alert('Симптом добавлен');
    }
}

// Загрузка симптомов
async function loadSymptoms() {
    const { data, error } = await supabase
        .from('symptoms')
        .select('*')
        .order('date', { ascending: false })
        .limit(10);
    
    if (error) {
        console.error('Ошибка загрузки симптомов:', error);
        return;
    }
    
    const symptomsList = document.getElementById('symptomsList');
    symptomsList.innerHTML = data.map(symptom => `
        <div class="symptom-card">
            <strong>${symptom.date}</strong> - ${symptom.type} 
            (${symptom.intensity}/10)
        </div>
    `).join('');
}

// Загрузка циклов
async function loadCycles() {
    const { data, error } = await supabase
        .from('cycles')
        .select('*')
        .order('start_date', { ascending: false })
        .limit(5);
    
    if (error) {
        console.error('Ошибка загрузки циклов:', error);
        return;
    }
    
    window.cyclesData = data;
}

// Рендер графика
function renderChart() {
    const canvas = document.getElementById('cycleChart');
    const ctx = canvas.getContext('2d');
    
    if (!window.cyclesData || window.cyclesData.length === 0) {
        ctx.fillStyle = '#666';
        ctx.fillText('Нет данных для отображения', 20, 20);
        return;
    }
    
    // Очищаем canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Подготавливаем данные
    const data = window.cyclesData.map(cycle => ({
        date: cycle.start_date,
        length: cycle.length
    }));
    
    // Настройки графика
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    
    // Находим минимум и максимум для масштабирования
    const lengths = data.map(d => d.length);
    const minLength = Math.min(...lengths);
    const maxLength = Math.max(...lengths);
    const range = maxLength - minLength || 1;
    
    // Рисуем оси
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Рисуем линию циклов
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.forEach((point, index) => {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        const y = canvas.height - padding - ((point.length - minLength) / range) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Рисуем точки
    ctx.fillStyle = '#8d6e63';
    data.forEach((point, index) => {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        const y = canvas.height - padding - ((point.length - minLength) / range) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Подписи
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // Подписи по оси X
    data.forEach((point, index) => {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        ctx.fillText(point.date, x, canvas.height - 10);
    });
    
    // Подписи по оси Y
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const value = minLength + (range * i / 5);
        const y = canvas.height - padding - (i / 5) * chartHeight;
        ctx.fillText(Math.round(value), padding - 10, y + 4);
    }
}