# 🏠 BookIt

Современная платформа для бронирования жилья, созданная с использованием React, TypeScript и FastAPI.

Пользователи могут просматривать объявления, бронировать жильё, управлять своими бронированиями, а администратор — контролировать работу платформы через специальную панель управления.

---

## ✨ Возможности

### 👤 Для пользователей

* 🔐 Регистрация и авторизация
* 🏡 Просмотр доступных объектов
* 📅 Создание бронирований
* 📖 Просмотр истории бронирований
* 📱 Адаптивный интерфейс для мобильных устройств

### 🛠 Для администратора

* 📊 Панель администратора
* 👥 Управление пользователями
* 🏠 Управление объектами
* 📈 Контроль бронирований

---

## 🚀 Технологии

### Frontend

* ⚛️ React
* 🔷 TypeScript
* 🧭 React Router
* ⚡ Vite

### Backend

* 🚀 FastAPI
* 🐍 Python
* 🗄 PostgreSQL
* 🔑 JWT Authentication
* 🔄 SQLAlchemy

### DevOps

* 🐳 Docker
* 🐳 Docker Compose

---

## 🌐 Демо

https://bookit-1-dupr.onrender.com

---

## ⚙️ Запуск проекта

### 1️⃣ Клонирование репозитория

```bash
git clone https://github.com/AzizIo/bookit.git
cd bookit
```

### 2️⃣ Запуск через Docker

```bash
docker compose up --build
```

---

## 🔧 Локальный запуск

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## 🔑 Переменные окружения

Создайте файл `.env`

```env
DATABASE_URL=
SECRET_KEY=
ADMIN_EMAIL=
```

---

## 📂 Структура проекта

```text
bookit/
│
├── frontend/       # React приложение
├── backend/        # FastAPI сервер
├── docker-compose.yml
└── README.md
```
---

## 👨‍💻 Автор

Разработано Azizbek в рамках изучения Full Stack разработки.

GitHub: https://github.com/AzizIo

---

⭐ Если проект понравился — поставьте звезду репозиторию.
