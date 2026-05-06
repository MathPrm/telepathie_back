import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { hashPassword, verifyPassword } from '../utils/password';

interface RegisterBody {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: boolean;
}

interface LoginBody {
  email?: string;
  password?: string;
}

const authRouter = Router();

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

authRouter.post(
  '/register',
  async (
    req: Request<unknown, unknown, RegisterBody>,
    res: Response,
  ): Promise<void> => {
    const firstName = req.body.firstName?.trim() ?? '';
    const lastName = req.body.lastName?.trim() ?? '';
    const email = req.body.email?.trim().toLowerCase() ?? '';
    const password = req.body.password ?? '';
    const confirmPassword = req.body.confirmPassword ?? '';
    const acceptTerms = req.body.acceptTerms === true;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ message: 'Adresse mail invalide.' });
      return;
    }

    if (password.length < 8) {
      res
        .status(400)
        .json({ message: 'Le mot de passe doit contenir au moins 8 caracteres.' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ message: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    if (!acceptTerms) {
      res.status(400).json({ message: 'Vous devez accepter les conditions.' });
      return;
    }

    try {
      const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [
        email,
      ]);

      if (existingUser.rowCount && existingUser.rowCount > 0) {
        res
          .status(409)
          .json({ message: 'Un compte existe deja avec cette adresse mail.' });
        return;
      }

      const passwordHash = await hashPassword(password);

      const result = await pool.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, accepted_terms)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, first_name, last_name, email, created_at`,
        [firstName, lastName, email, passwordHash, acceptTerms],
      );

      res.status(201).json({
        message: 'Inscription reussie.',
        user: result.rows[0],
      });
    } catch (error) {
      console.error("Erreur pendant l'inscription :", error);
      res.status(500).json({ message: "Erreur serveur pendant l'inscription." });
    }
  },
);

authRouter.post(
  '/login',
  async (
    req: Request<unknown, unknown, LoginBody>,
    res: Response,
  ): Promise<void> => {
    const email = req.body.email?.trim().toLowerCase() ?? '';
    const password = req.body.password ?? '';

    if (!email || !password) {
      res
        .status(400)
        .json({ message: 'Adresse mail et mot de passe sont obligatoires.' });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ message: 'Adresse mail invalide.' });
      return;
    }

    try {
      const result = await pool.query(
        `SELECT id, first_name, last_name, email, password_hash, created_at
         FROM users
         WHERE email = $1`,
        [email],
      );

      if (!result.rowCount || result.rowCount === 0) {
        res.status(401).json({ message: 'Identifiants invalides.' });
        return;
      }

      const user = result.rows[0] as {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        password_hash: string;
        created_at: string;
      };

      const isValidPassword = await verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        res.status(401).json({ message: 'Identifiants invalides.' });
        return;
      }

      res.status(200).json({
        message: 'Connexion reussie.',
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          createdAt: user.created_at,
        },
      });
    } catch (error) {
      console.error('Erreur pendant la connexion :', error);
      res.status(500).json({ message: 'Erreur serveur pendant la connexion.' });
    }
  },
);

export default authRouter;
