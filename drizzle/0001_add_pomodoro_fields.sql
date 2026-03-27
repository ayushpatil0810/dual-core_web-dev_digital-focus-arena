-- Migration: Add Pomodoro support to focus_session table
-- Generated: 2026-03-27

ALTER TABLE "focus_session"
ADD COLUMN IF NOT EXISTS "pomodoro_enabled" boolean DEFAULT false;

ALTER TABLE "focus_session"
ADD COLUMN IF NOT EXISTS "cycles_completed" text DEFAULT '0';

ALTER TABLE "focus_session"
ADD COLUMN IF NOT EXISTS "break_minutes" text DEFAULT '0';