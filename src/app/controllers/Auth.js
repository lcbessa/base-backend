import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../schemas/User';
import authConfig from '../../config/auth';
import Mailer from '../../modules/Mailer';

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
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (user) {
        const token = crypto.randomBytes(20).toString('hex');
        const expiration = new Date();
        expiration.setHours(new Date().getHours() + 1);

        User.findByIdAndUpdate(user.id, {
          $set: {
            passwordResetToken: token,
            passwordResetTokenExpiration: expiration,
          },
        })
          .then(() => {
            Mailer.sendMail(
              {
                to: email,
                from: 'email@domain.com',
                template: 'auth/forgot_password',
                context: { token },
              },
              (error) => {
                if (error) {
                  console.error('Erro ao enviar email', error);
                  return res.status(400).send({
                    error: 'Falha ao enviar email de recuperação de senha',
                  });
                } else {
                  return res.send();
                }
              },
            );
          })
          .catch((error) => {
            console.error(
              'Erro ao salvar o token de recuperação de senha',
              error,
            );
            return res.status(500).send({ error: 'Erro interno no servidor' });
          });
      } else {
        res.status(404).send({ error: 'Usuário não encontrado' });
      }
    })
    .catch((error) => {
      console.error('Erro no esqueceu a senha', error);
      return res.status(500).send({ error: 'Erro interno no servidor' });
    });
});

router.post('/reset-password', (req, res) => {
  const { email, token, newPassword } = req.body;

  User.findOne({ email })
    .select('+ passwordResetToken passwordResetTokenExpiration')
    .then((user) => {
      if (user) {
        if (
          token != user.passwordResetToken ||
          new Date().now > user.passwordResetTokenExpiration
          // ou o token tá errado ou expirou
        ) {
          return res.status(400).send({ error: 'Token Inválido' });
        } else {
          user.passwordResetToken = undefined;
          user.passwordResetTokenExpiration = undefined;
          user.password = newPassword;

          user
            .save()
            .then(() => {
              return res.send({ message: 'Senha trocada com sucesso' });
            })
            .catch((error) => {
              console.error('Erro ao salvar nova senha do usuario', error);
              return res
                .status(500)
                .send({ error: 'Erro interno no servidor' });
            });
        }
      } else {
        return res.status(404).send({ error: 'Usuário não existe!' });
      }
    })
    .catch((error) => {
      console.error('Erro no recuperar minha senha', error);
      return res.status(500).send({ error: 'Erro interno no servidor' });
    });
});

export default router;
