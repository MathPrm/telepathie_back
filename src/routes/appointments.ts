import { Request, Response, Router } from 'express';
import pool from '../config/db';

interface AppointmentType {
  label: string;
  durationMinutes: number;
}

interface CreateAppointmentBody {
  practitionerId?: number;
  patientUserId?: number;
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
  appointmentTypeLabel?: string;
  appointmentTypeDurationMinutes?: number;
}

interface UserRoleRow {
  id: number | string;
  role: 'patient' | 'practitioner';
  first_name: string;
  last_name: string;
  email: string;
}

interface PractitionerSettingsRow {
  appointment_types: AppointmentType[] | null;
}

const appointmentsRouter = Router();

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const toMinutes = (value: string): number => {
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
};

const isValidDateString = (value: string): boolean => DATE_PATTERN.test(value);
const isValidTimeString = (value: string): boolean => TIME_PATTERN.test(value);

const isFutureOrToday = (dateIso: string): boolean => {
  const now = new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(now.getDate()).padStart(2, '0')}`;
  return dateIso >= todayIso;
};

appointmentsRouter.post(
  '/',
  async (
    req: Request<unknown, unknown, CreateAppointmentBody>,
    res: Response,
  ): Promise<void> => {
    const practitionerId = Number(req.body.practitionerId);
    const patientUserId = Number(req.body.patientUserId);
    const appointmentDate = (req.body.appointmentDate ?? '').trim();
    const startTime = (req.body.startTime ?? '').trim();
    const endTime = (req.body.endTime ?? '').trim();
    const appointmentTypeLabel = (req.body.appointmentTypeLabel ?? '').trim();
    const appointmentTypeDurationMinutes = Number(
      req.body.appointmentTypeDurationMinutes,
    );

    if (
      !Number.isFinite(practitionerId) ||
      !Number.isFinite(patientUserId) ||
      !appointmentDate ||
      !startTime ||
      !endTime ||
      !appointmentTypeLabel ||
      !Number.isInteger(appointmentTypeDurationMinutes)
    ) {
      res.status(400).json({ message: 'Parametres de reservation invalides.' });
      return;
    }

    if (!isValidDateString(appointmentDate)) {
      res.status(400).json({ message: 'Date de rendez-vous invalide.' });
      return;
    }

    if (!isValidTimeString(startTime) || !isValidTimeString(endTime)) {
      res.status(400).json({ message: 'Heure de rendez-vous invalide.' });
      return;
    }

    if (toMinutes(startTime) >= toMinutes(endTime)) {
      res.status(400).json({ message: "L'heure de fin doit etre apres l'heure de debut." });
      return;
    }

    const computedDuration = toMinutes(endTime) - toMinutes(startTime);
    if (computedDuration !== appointmentTypeDurationMinutes) {
      res.status(400).json({ message: 'La duree du creneau est incoherente.' });
      return;
    }

    if (appointmentTypeDurationMinutes < 5 || appointmentTypeDurationMinutes > 180) {
      res.status(400).json({ message: 'La duree du rendez-vous est invalide.' });
      return;
    }

    if (!isFutureOrToday(appointmentDate)) {
      res.status(400).json({ message: 'Impossible de reserver un creneau passe.' });
      return;
    }

    const now = new Date();
    const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(now.getDate()).padStart(2, '0')}`;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    if (appointmentDate === todayIso && toMinutes(startTime) <= nowMinutes) {
      res.status(400).json({ message: 'Impossible de reserver un creneau deja passe.' });
      return;
    }

    try {
      const practitionerResult = await pool.query<UserRoleRow>(
        `SELECT id, role, first_name, last_name, email
         FROM users
         WHERE id = $1`,
        [practitionerId],
      );
      if (practitionerResult.rows.length === 0 || practitionerResult.rows[0].role !== 'practitioner') {
        res.status(404).json({ message: 'Praticien introuvable.' });
        return;
      }

      const patientResult = await pool.query<UserRoleRow>(
        `SELECT id, role, first_name, last_name, email
         FROM users
         WHERE id = $1`,
        [patientUserId],
      );
      if (patientResult.rows.length === 0 || patientResult.rows[0].role !== 'patient') {
        res.status(403).json({ message: 'Reservation reservee aux utilisateurs patients.' });
        return;
      }

      const settingsResult = await pool.query<PractitionerSettingsRow>(
        `SELECT appointment_types
         FROM practitioner_settings
         WHERE user_id = $1`,
        [practitionerId],
      );

      const appointmentTypes = Array.isArray(settingsResult.rows[0]?.appointment_types)
        ? settingsResult.rows[0].appointment_types
        : [];

      const hasMatchingType = appointmentTypes.some(
        (item) =>
          item &&
          typeof item.label === 'string' &&
          item.label.trim() === appointmentTypeLabel &&
          Number(item.durationMinutes) === appointmentTypeDurationMinutes,
      );

      if (!hasMatchingType) {
        res.status(400).json({ message: 'Type de rendez-vous invalide pour ce praticien.' });
        return;
      }

      const patient = patientResult.rows[0];

      const insertResult = await pool.query(
        `INSERT INTO appointments (
           practitioner_user_id,
           patient_user_id,
           appointment_date,
           start_time,
           end_time,
           appointment_type_label,
           appointment_type_duration_minutes,
           patient_first_name,
           patient_last_name,
           patient_email
         )
         VALUES ($1, $2, $3::date, $4::time, $5::time, $6, $7, $8, $9, $10)
         RETURNING
           id,
           practitioner_user_id,
           patient_user_id,
           appointment_date,
           start_time,
           end_time,
           appointment_type_label,
           appointment_type_duration_minutes,
           status,
           created_at`,
        [
          practitionerId,
          patientUserId,
          appointmentDate,
          startTime,
          endTime,
          appointmentTypeLabel,
          appointmentTypeDurationMinutes,
          patient.first_name,
          patient.last_name,
          patient.email,
        ],
      );

      res.status(201).json({
        message: 'Rendez-vous reserve.',
        appointment: insertResult.rows[0],
      });
    } catch (error) {
      const maybeError = error as { code?: string };
      if (maybeError.code === '23505') {
        res.status(409).json({ message: 'Ce creneau est deja reserve.' });
        return;
      }

      console.error('Erreur creation rendez-vous:', error);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  },
);

export default appointmentsRouter;
