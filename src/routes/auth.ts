import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { hashPassword } from '../utils/password';

interface RegisterBody {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: boolean;
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

export default authRouter;
