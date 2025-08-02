// Конфигурация Supabase
const supabaseUrl = 'https://wistzzjfcjnqwmvdfpue.supabase.co'; // Замените на ваш URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indpc3R6empmY2pucXdtdmRmcHVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzUxOTAsImV4cCI6MjA2OTcxMTE5MH0.0t7BxLoamVff3LCLwww86c646yE-GN94P1fi7iUsmBY'; // Замените на ваш ключ

// Инициализация клиента Supabase
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Экспорт для использования в других файлах
window.supabase = supabase;

// Обработка изменений состояния авторизации
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
    
    if (event === 'SIGNED_IN') {
        // Пользователь вошел
        document.dispatchEvent(new CustomEvent('user-signed-in', { detail: session }));
    } else if (event === 'SIGNED_OUT') {
        // Пользователь вышел
        document.dispatchEvent(new CustomEvent('user-signed-out'));
    }
});