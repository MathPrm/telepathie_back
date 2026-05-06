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

interface PatientAppointmentRow {
  id: number | string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  appointment_type_label: string;
  appointment_type_duration_minutes: number;
  status: string;
  created_at: string;
  practitioner_id: number | string;
  practitioner_first_name: string;
  practitioner_last_name: string;
  practitioner_specialty: string | null;
}

interface PractitionerWeeklyScheduleRow {
  weekly_schedule:
    | Array<{
        day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
        enabled: boolean;
        startTime: string;
        endTime: string;
        breakStart: string;
        breakEnd: string;
      }>
    | null;
}

interface PractitionerCalendarAppointmentRow {
  id: number | string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  appointment_type_label: string;
  patient_first_name: string;
  patient_last_name: string;
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

const getTodayIso = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(now.getDate()).padStart(2, '0')}`;
};

const canCancelMoreThan24HoursBefore = (dateIso: string, startTime: string): boolean => {
  const [hour, minute] = startTime.split(':').map(Number);
  const startDateTime = new Date(dateIso);
  startDateTime.setHours(hour, minute, 0, 0);
  const diffMs = startDateTime.getTime() - Date.now();
  return diffMs > 24 * 60 * 60 * 1000;
};

const getDefaultWeeklySchedule = (): PractitionerWeeklyScheduleRow['weekly_schedule'] => [
  {
    day: 'mon',
    enabled: true,
    startTime: '09:00',
    endTime: '18:00',
    breakStart: '',
    breakEnd: '',
  },
  {
    day: 'tue',
    enabled: true,
    startTime: '09:00',
    endTime: '18:00',
    breakStart: '',
    breakEnd: '',
  },
  {
    day: 'wed',
    enabled: true,
    startTime: '09:00',
    endTime: '18:00',
    breakStart: '',
    breakEnd: '',
  },
  {
    day: 'thu',
    enabled: true,
    startTime: '09:00',
    endTime: '18:00',
    breakStart: '',
    breakEnd: '',
  },
  {
    day: 'fri',
    enabled: true,
    startTime: '09:00',
    endTime: '18:00',
    breakStart: '',
    breakEnd: '',
  },
  {
    day: 'sat',
    enabled: false,
    startTime: '',
    endTime: '',
    breakStart: '',
    breakEnd: '',
  },
  {
    day: 'sun',
    enabled: false,
    startTime: '',
    endTime: '',
    breakStart: '',
    breakEnd: '',
  },
];

appointmentsRouter.get(
  '/practitioner/:userId/calendar',
  async (req: Request<{ userId: string }>, res: Response): Promise<void> => {
    const userId = Number(req.params.userId);
    if (!Number.isFinite(userId)) {
      res.status(400).json({ message: 'Identifiant utilisateur invalide.' });
      return;
    }

    try {
      const practitionerResult = await pool.query<UserRoleRow>(
        `SELECT id, role, first_name, last_name, email
         FROM users
         WHERE id = $1`,
        [userId],
      );

      if (
        practitionerResult.rows.length === 0 ||
        practitionerResult.rows[0].role !== 'practitioner'
      ) {
        res.status(403).json({ message: 'Acces réservé aux praticiens.' });
        return;
      }

      const settingsResult = await pool.query<PractitionerWeeklyScheduleRow>(
        `SELECT weekly_schedule
         FROM practitioner_settings
         WHERE user_id = $1`,
        [userId],
      );

      const weeklySchedule = Array.isArray(settingsResult.rows[0]?.weekly_schedule)
        ? settingsResult.rows[0].weekly_schedule
        : getDefaultWeeklySchedule();

      const appointmentsResult = await pool.query<PractitionerCalendarAppointmentRow>(
        `SELECT
           id,
           appointment_date::text AS appointment_date,
           start_time::text AS start_time,
           end_time::text AS end_time,
           appointment_type_label,
           patient_first_name,
           patient_last_name
         FROM appointments
         WHERE practitioner_user_id = $1
           AND status = 'booked'
         ORDER BY appointment_date ASC, start_time ASC`,
        [userId],
      );

      res.status(200).json({
        weeklySchedule,
        appointments: appointmentsResult.rows.map((item) => ({
          id: Number(item.id),
          appointmentDate: item.appointment_date,
          startTime: item.start_time.slice(0, 5),
          endTime: item.end_time.slice(0, 5),
          appointmentTypeLabel: item.appointment_type_label,
          patientFirstName: item.patient_first_name,
          patientLastName: item.patient_last_name,
        })),
      });
    } catch (error) {
      console.error('Erreur lecture calendrier praticien:', error);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  },
);

appointmentsRouter.get(
  '/patient/:userId',
  async (req: Request<{ userId: string }>, res: Response): Promise<void> => {
    const userId = Number(req.params.userId);
    if (!Number.isFinite(userId)) {
      res.status(400).json({ message: 'Identifiant utilisateur invalide.' });
      return;
    }

    try {
      const patientResult = await pool.query<UserRoleRow>(
        `SELECT id, role, first_name, last_name, email
         FROM users
         WHERE id = $1`,
        [userId],
      );

      if (patientResult.rows.length === 0 || patientResult.rows[0].role !== 'patient') {
        res.status(403).json({ message: 'Acces réservé aux utilisateurs patients.' });
        return;
      }

      const { rows } = await pool.query<PatientAppointmentRow>(
        `SELECT
           a.id,
           a.appointment_date::text AS appointment_date,
           a.start_time::text AS start_time,
           a.end_time::text AS end_time,
           a.appointment_type_label,
           a.appointment_type_duration_minutes,
           a.status,
           a.created_at,
           p.id AS practitioner_id,
           p.first_name AS practitioner_first_name,
           p.last_name AS practitioner_last_name,
           ps.specialty AS practitioner_specialty
         FROM appointments a
         INNER JOIN users p ON p.id = a.practitioner_user_id
         LEFT JOIN practitioner_settings ps ON ps.user_id = p.id
         WHERE a.patient_user_id = $1
         ORDER BY a.appointment_date ASC, a.start_time ASC`,
        [userId],
      );

      res.status(200).json({
        appointments: rows.map((row) => ({
          id: Number(row.id),
          practitioner: {
            id: Number(row.practitioner_id),
            firstName: row.practitioner_first_name,
            lastName: row.practitioner_last_name,
            specialty: row.practitioner_specialty ?? '',
          },
          appointmentTypeLabel: row.appointment_type_label,
          appointmentTypeDurationMinutes: row.appointment_type_duration_minutes,
          appointmentDate: row.appointment_date,
          startTime: row.start_time,
          endTime: row.end_time,
          status: row.status,
          reservedAt: row.created_at,
        })),
      });
    } catch (error) {
      console.error('Erreur lecture rendez-vous patient:', error);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  },
);

appointmentsRouter.patch(
  '/:appointmentId/cancel',
  async (
    req: Request<{ appointmentId: string }, unknown, { patientUserId?: number }>,
    res: Response,
  ): Promise<void> => {
    const appointmentId = Number(req.params.appointmentId);
    const patientUserId = Number(req.body.patientUserId);
    if (!Number.isFinite(appointmentId) || !Number.isFinite(patientUserId)) {
      res.status(400).json({ message: 'Paramètres invalides.' });
      return;
    }

    try {
      const { rows } = await pool.query<{
        id: number | string;
        status: string;
        appointment_date: string;
        start_time: string;
      }>(
        `SELECT id, status, appointment_date::text AS appointment_date, start_time::text AS start_time
         FROM appointments
         WHERE id = $1 AND patient_user_id = $2`,
        [appointmentId, patientUserId],
      );

      if (rows.length === 0) {
        res.status(404).json({ message: 'Rendez-vous introuvable.' });
        return;
      }

      const appointment = rows[0];
      if (appointment.status !== 'booked') {
        res.status(400).json({ message: 'Ce rendez-vous ne peut plus etre annulé.' });
        return;
      }

      if (!canCancelMoreThan24HoursBefore(appointment.appointment_date, appointment.start_time)) {
        res.status(400).json({ message: "Annulation impossible à moins de 24h du rendez-vous." });
        return;
      }

      await pool.query(
        `UPDATE appointments
         SET status = 'cancelled'
         WHERE id = $1`,
        [appointmentId],
      );

      res.status(200).json({ message: 'Rendez-vous annulé.' });
    } catch (error) {
      console.error('Erreur annulation rendez-vous:', error);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  },
);

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
      res.status(400).json({ message: 'Paramètres de réservation invalides.' });
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
      res.status(400).json({ message: "L'heure de fin doit être après l'heure de début." });
      return;
    }

    const computedDuration = toMinutes(endTime) - toMinutes(startTime);
    if (computedDuration !== appointmentTypeDurationMinutes) {
      res.status(400).json({ message: 'La durée du créneau est incohérente.' });
      return;
    }

    if (appointmentTypeDurationMinutes < 5 || appointmentTypeDurationMinutes > 180) {
      res.status(400).json({ message: 'La durée du rendez-vous est invalide.' });
      return;
    }

    if (!isFutureOrToday(appointmentDate)) {
      res.status(400).json({ message: 'Impossible de réserver un créneau passé.' });
      return;
    }

    const todayIso = getTodayIso();
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    if (appointmentDate === todayIso && toMinutes(startTime) <= nowMinutes) {
      res.status(400).json({ message: 'Impossible de réserver un créneau déjà passé.' });
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
        res.status(403).json({ message: 'Réservation réservée aux utilisateurs patients.' });
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
        message: 'Rendez-vous réservé.',
        appointment: insertResult.rows[0],
      });
    } catch (error) {
      const maybeError = error as { code?: string };
      if (maybeError.code === '23505') {
        res.status(409).json({ message: 'Ce créneau est déjà réservé.' });
        return;
      }

      console.error('Erreur création rendez-vous:', error);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  },
);

export default appointmentsRouter;
