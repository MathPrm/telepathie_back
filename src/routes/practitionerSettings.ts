import { Request, Response, Router } from 'express';
import pool from '../config/db';

interface AppointmentType {
  label: string;
  durationMinutes: number;
}

interface DaySchedule {
  day: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
}

interface UpdateSettingsBody {
  specialty?: string;
  appointmentTypes?: AppointmentType[];
  weeklySchedule?: DaySchedule[];
}

interface PractitionerSearchRow {
  user_id: number | string;
  first_name: string;
  last_name: string;
  specialty: string | null;
  appointment_types: AppointmentType[] | null;
}

interface PractitionerPublicRow {
  user_id: number | string;
  first_name: string;
  last_name: string;
  specialty: string | null;
  appointment_types: AppointmentType[] | null;
  weekly_schedule: DaySchedule[] | null;
}

const practitionerSettingsRouter = Router();
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const isValidTime = (value: string): boolean => TIME_PATTERN.test(value);

const isBefore = (left: string, right: string): boolean => left < right;

const getDefaultWeeklySchedule = (): DaySchedule[] => [
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

const ensurePractitioner = async (userId: number): Promise<boolean> => {
  const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
  if (!userResult.rowCount || userResult.rowCount === 0) {
    return false;
  }
  return userResult.rows[0].role === 'practitioner';
};

const parseUserId = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

const validateAppointmentTypes = (
  appointmentTypes: AppointmentType[],
): string | null => {
  if (!Array.isArray(appointmentTypes)) {
    return 'Le format des types de rendez-vous est invalide.';
  }

  for (const item of appointmentTypes) {
    if (!item || typeof item.label !== 'string' || item.label.trim().length < 2) {
      return 'Chaque type de rendez-vous doit avoir un libellé valide.';
    }

    if (
      typeof item.durationMinutes !== 'number' ||
      !Number.isInteger(item.durationMinutes) ||
      item.durationMinutes < 5 ||
      item.durationMinutes > 180
    ) {
      return 'La durée des rendez-vous doit être comprise entre 5 et 180 minutes.';
    }
  }

  return null;
};

const validateWeeklySchedule = (weeklySchedule: DaySchedule[]): string | null => {
  if (!Array.isArray(weeklySchedule) || weeklySchedule.length !== 7) {
    return 'Le planning hebdomadaire doit contenir 7 jours.';
  }

  const daysSeen = new Set<string>();

  for (const row of weeklySchedule) {
    if (!row || typeof row.day !== 'string' || !DAY_KEYS.includes(row.day as never)) {
      return 'Un jour du planning est invalide.';
    }
    if (daysSeen.has(row.day)) {
      return 'Chaque jour doit apparaitre une seule fois dans le planning.';
    }
    daysSeen.add(row.day);

    if (typeof row.enabled !== 'boolean') {
      return 'Le statut de disponibilité doit être un booléen.';
    }

    if (row.enabled) {
      if (!isValidTime(row.startTime) || !isValidTime(row.endTime)) {
        return 'Les heures de début et de fin sont invalides.';
      }
      if (!isBefore(row.startTime, row.endTime)) {
        return "L'heure de début doit être avant l'heure de fin.";
      }

      const hasBreakStart = row.breakStart.trim().length > 0;
      const hasBreakEnd = row.breakEnd.trim().length > 0;

      if (hasBreakStart !== hasBreakEnd) {
        return 'La pause midi doit contenir une heure de debut et une heure de fin.';
      }

      if (hasBreakStart && hasBreakEnd) {
        if (!isValidTime(row.breakStart) || !isValidTime(row.breakEnd)) {
          return 'Les heures de pause midi sont invalides.';
        }
        if (!isBefore(row.breakStart, row.breakEnd)) {
          return "L'heure de début de pause doit être avant la fin de pause.";
        }
        if (!isBefore(row.startTime, row.breakStart) || !isBefore(row.breakEnd, row.endTime)) {
          return "La pause midi doit être comprise dans la plage d'ouverture.";
        }
      }
    }
  }

  return null;
};

practitionerSettingsRouter.get(
  '/search',
  async (req: Request<unknown, unknown, unknown, { q?: string }>, res: Response): Promise<void> => {
    const query = (req.query.q ?? '').trim();

    if (!query) {
      res.status(200).json({ query, results: [] });
      return;
    }

    try {
      const sql = `
        SELECT
          u.id AS user_id,
          u.first_name,
          u.last_name,
          ps.specialty,
          ps.appointment_types
        FROM users u
        LEFT JOIN practitioner_settings ps ON ps.user_id = u.id
        WHERE
          u.role = 'practitioner'
          AND (
            u.first_name ILIKE $1
            OR u.last_name ILIKE $1
            OR COALESCE(ps.specialty, '') ILIKE $1
          )
        ORDER BY u.last_name ASC, u.first_name ASC
        LIMIT 100
      `;

      const { rows } = await pool.query<PractitionerSearchRow>(sql, [`%${query}%`]);

      res.status(200).json({
        query,
        results: rows.map((row) => ({
          id: Number(row.user_id),
          firstName: row.first_name,
          lastName: row.last_name,
          specialty: row.specialty ?? '',
          appointmentTypes: Array.isArray(row.appointment_types)
            ? row.appointment_types
            : [],
        })),
      });
    } catch (error) {
      console.error('Erreur recherche praticiens:', error);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  },
);

practitionerSettingsRouter.get(
  '/:userId/public-profile',
  async (req: Request<{ userId: string }>, res: Response): Promise<void> => {
    const userId = parseUserId(req.params.userId);
    if (!Number.isFinite(userId)) {
      res.status(400).json({ message: 'Identifiant utilisateur invalide.' });
      return;
    }

    try {
      const sql = `
        SELECT
          u.id AS user_id,
          u.first_name,
          u.last_name,
          ps.specialty,
          ps.appointment_types,
          ps.weekly_schedule
        FROM users u
        LEFT JOIN practitioner_settings ps ON ps.user_id = u.id
        WHERE u.id = $1 AND u.role = 'practitioner'
      `;

      const { rows } = await pool.query<PractitionerPublicRow>(sql, [userId]);
      if (rows.length === 0) {
        res.status(404).json({ message: 'Praticien introuvable.' });
        return;
      }

      const row = rows[0];
      res.status(200).json({
        id: Number(row.user_id),
        firstName: row.first_name,
        lastName: row.last_name,
        specialty: row.specialty ?? '',
        appointmentTypes: Array.isArray(row.appointment_types)
          ? row.appointment_types
          : [],
        weeklySchedule: Array.isArray(row.weekly_schedule)
          ? row.weekly_schedule
          : getDefaultWeeklySchedule(),
      });
    } catch (error) {
      console.error('Erreur profil public praticien:', error);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  },
);

practitionerSettingsRouter.get(
  '/:userId/settings',
  async (req: Request<{ userId: string }>, res: Response): Promise<void> => {
    const userId = parseUserId(req.params.userId);
    if (!Number.isFinite(userId)) {
      res.status(400).json({ message: 'Identifiant utilisateur invalide.' });
      return;
    }

    try {
      const isPractitioner = await ensurePractitioner(userId);
      if (!isPractitioner) {
        res.status(403).json({ message: 'Acces réservé aux praticiens.' });
        return;
      }

      const result = await pool.query(
        `SELECT specialty, appointment_types, weekly_schedule
         FROM practitioner_settings
         WHERE user_id = $1`,
        [userId],
      );

      if (!result.rowCount || result.rowCount === 0) {
        res.status(200).json({
          specialty: '',
          appointmentTypes: [],
          weeklySchedule: getDefaultWeeklySchedule(),
        });
        return;
      }

      res.status(200).json({
        specialty: result.rows[0].specialty ?? '',
        appointmentTypes: result.rows[0].appointment_types ?? [],
        weeklySchedule: result.rows[0].weekly_schedule ?? getDefaultWeeklySchedule(),
      });
    } catch (error) {
      console.error('Erreur lecture paramètres praticien:', error);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  },
);

practitionerSettingsRouter.put(
  '/:userId/settings',
  async (
    req: Request<{ userId: string }, unknown, UpdateSettingsBody>,
    res: Response,
  ): Promise<void> => {
    const userId = parseUserId(req.params.userId);
    if (!Number.isFinite(userId)) {
      res.status(400).json({ message: 'Identifiant utilisateur invalide.' });
      return;
    }

    const specialty = req.body.specialty?.trim() ?? '';
    const appointmentTypes = req.body.appointmentTypes ?? [];
    const weeklySchedule = req.body.weeklySchedule ?? [];

    if (specialty.length < 2) {
      res.status(400).json({ message: 'La spécialité est obligatoire.' });
      return;
    }

    const appointmentError = validateAppointmentTypes(appointmentTypes);
    if (appointmentError) {
      res.status(400).json({ message: appointmentError });
      return;
    }

    const weeklyScheduleError = validateWeeklySchedule(weeklySchedule);
    if (weeklyScheduleError) {
      res.status(400).json({ message: weeklyScheduleError });
      return;
    }

    try {
      const isPractitioner = await ensurePractitioner(userId);
      if (!isPractitioner) {
        res.status(403).json({ message: 'Accès réservé aux praticiens.' });
        return;
      }

      await pool.query(
        `INSERT INTO practitioner_settings (user_id, specialty, appointment_types, weekly_schedule, updated_at)
         VALUES ($1, $2, $3::jsonb, $4::jsonb, NOW())
         ON CONFLICT (user_id)
         DO UPDATE
         SET specialty = EXCLUDED.specialty,
             appointment_types = EXCLUDED.appointment_types,
             weekly_schedule = EXCLUDED.weekly_schedule,
             updated_at = NOW()`,
        [userId, specialty, JSON.stringify(appointmentTypes), JSON.stringify(weeklySchedule)],
      );

      res.status(200).json({ message: 'Paramètres praticien enregistrés.' });
    } catch (error) {
      console.error('Erreur sauvegarde paramètres praticien:', error);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  },
);

export default practitionerSettingsRouter;
