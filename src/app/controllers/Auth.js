import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../schemas/User';
import authConfig from '../../config/Auth';

const router = new Router();

const generateToken = (params) => {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400,
  });
};

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  User.findOne({ email })
    .then((userData) => {
      if (userData) {
        return res.status(400).send({ error: 'Usuário já existe' });
      } else {
        User.create({ name, email, password })
          .then((user) => {
            return res.send({ user });
          })
          .catch((error) => {
            console.error('Erro ao salvar usuário', error);
            return res.status(400).send({ error: 'Falha ao registrar' });
          });
      }
    })
    .catch((error) => {
      console.error('Erro ao consultar usuario no banco de dados', error);
      return res.status(500).send({ error: 'Falha ao registrar cadastro' });
    });
});
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .select('+password')
    .then((user) => {
      if (user) {
        bcrypt
          .compare(password, user.password)
          .then((result) => {
            if (result) {
              const token = generateToken({ uid: user.id });
              return res.send({ token: token, tokenExpiration: '1d' });
            } else {
              return res.status(400).send({ error: 'Senha Invalida' });
            }
          })
          .catch((error) => {
            console.error('Erro ao verificar senha', error);
            return res.status(500).send({ error: 'Erro interno do servidor!' });
          });
      } else {
        return res.status(404).send({ error: 'Usuário não encontrado!' });
      }
    })
    .catch((error) => {
      console.error('Erro ao logar', error);
      return res.status(500).send({ error: 'Error interno do servidor!' });
    });
});
router.post('/forgot-password', (req, res) => {});
router.post('/reset-password', (req, res) => {});

export default router;
