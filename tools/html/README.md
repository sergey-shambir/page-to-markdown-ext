# Запуск Python скриптов из данного каталога

## 1. Создание и активация virtualenv

```bash
# Создание
python -m venv .venv

# Активация
source .venv/bin/activate

# Проверка, что python указывает на виртуальное окружение
which python
```

## 2. Установка зависимостей

```bash
pip install -r requirements.txt
```

## 3. Запуск тестов

```bash
# Запуск тестов
pytest

# Запуск с обновлением снапшотов
pytest --snapshot-update
```

# Прочие процессы

## 1. Установка новых библиотек и заморозка зависимостей

На примере pytest-snapshot:

```bash
pip install pytest-snapshot

pip freeze > requirements.txt
```
