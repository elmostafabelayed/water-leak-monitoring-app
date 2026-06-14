# Database Schema and Relationships

Generated from `backend/app/Models` and `backend/database/migrations`.

## Overview

This app uses a Laravel backend with the following main domain tables:

- `users`
- `sensors`
- `water_readings`
- `alerts`
- `leak_events`
- `settings`
- `valve_logs`
- `water_data`

Additionally, Laravel support tables are present for auth, sessions, caching, jobs, and API tokens.

---

## Tables

### `users`

Columns:
- `id`
- `name`
- `email` (unique)
- `email_verified_at`
- `password`
- `remember_token`
- `created_at`
- `updated_at`

Notes:
- Standard Laravel authentication user table.

### `sensors`

Columns:
- `id`
- `user_id` → `users.id`
- `name`
- `location`
- `last_reading`
- `last_seen_at`
- `uptime_seconds`
- `signal`
- `battery`
- `firmware`
- `ssid`
- `node_id`
- `created_at`
- `updated_at`

Relationships:
- `Sensor` belongsTo `User`

### `water_readings`

Columns:
- `id`
- `user_id` → `users.id`
- `sensor_id` → `sensors.id` (nullable)
- `flow_rate`
- `pressure`
- `is_leak`
- `temperature` (added later via migration)
- `valve_status` (added later via migration)
- `battery_level`
- `signal_strength`
- `created_at`
- `updated_at`

Notes:
- `sensor_id` is nullable and uses `nullOnDelete()`.
- `temperature` and `valve_status` were added after initial creation.

### `alerts`

Columns:
- `id`
- `user_id` → `users.id`
- `type`
- `severity` (`CRITICAL`, `WARNING`, `INFO`)
- `description`
- `is_acknowledged`
- `created_at`
- `updated_at`

Notes:
- Alerts are linked to users and describe leak/system notifications.

### `leak_events`

Columns:
- `id`
- `user_id` → `users.id` (nullable)
- `severity` (`low`, `medium`, `critical`)
- `flow_rate_detected`
- `location`
- `auto_closed`
- `response_time_ms`
- `created_at`
- `updated_at`

Relationships:
- `LeakEvent` belongsTo `User`

### `settings`

Columns:
- `id`
- `user_id` → `users.id` (unique)
- `valve_mode` (`auto`, `manual`)
- `push_notifications`
- `email_alerts`
- `created_at`
- `updated_at`

Relationships:
- `Setting` belongsTo `User`

Notes:
- Each user can have one settings row because `user_id` is unique.

### `valve_logs`

Columns:
- `id`
- `user_id` → `users.id`
- `action`
- `triggered_by`
- `created_at`
- `updated_at`

Notes:
- Logs valve open/close actions and who triggered them.

### `water_data`

Columns:
- `id`
- `device_id`
- `flow_rate`
- `total_liters`
- `status`
- `valve_open`
- `mode`
- `leak_detected`
- `force_notify`
- `created_at`
- `updated_at`

Notes:
- `water_data` stores device-level state and is not currently linked by foreign key to `users` or `sensors`.

---

## Support Tables

These tables are part of Laravel runtime support, not core domain entities.

### `personal_access_tokens`
- API token storage for `Laravel\Sanctum`.

### `password_reset_tokens`
- Password reset token storage.

### `sessions`
- Session storage for authenticated users.

### `cache`, `cache_locks`
- Laravel cache storage and lock metadata.

### `jobs`, `job_batches`, `failed_jobs`
- Queue and background job support tables.

---

## Relationship Summary

### User relations
- `User` hasMany `Sensor`
- `User` hasMany `WaterReading`
- `User` hasMany `Alert`
- `User` hasMany `LeakEvent`
- `User` hasMany `ValveLog`
- `User` hasOne `Setting`

### Sensor relations
- `Sensor` belongsTo `User`
- `WaterReading` references `Sensor` via `sensor_id`

### WaterReading relations
- `WaterReading` references `User` via `user_id`
- `WaterReading` references `Sensor` via `sensor_id`

### Settings relations
- `Setting` belongsTo `User`

### LeakEvent relations
- `LeakEvent` belongsTo `User`

## Notes

- The schema is based on the current migration files and model definitions.
- Some Eloquent models omit explicit relationship methods despite having foreign keys.
- The `settings` table enforces one settings record per user.
