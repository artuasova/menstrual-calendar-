// Конфигурация Supabase
const supabaseUrl = 'YOUR_SUPABASE_URL'; // Замените на ваш URL
const supabaseKey = 'YOUR_SUPABASE_KEY'; // Замените на ваш ключ

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