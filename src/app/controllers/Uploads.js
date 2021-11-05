import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = new Router();

router.get('/:path/:filename', (req, res) => {
  const filePath = path.resolve(
    `./uploads/${req.params.path}/${req.params.filename}`,
  );
  fs.exists(filePath, (exists) => {
    if (exists) {
      return res.sendFile(filePath);
    } else {
      return res.status(404).send({ error: 'Arquivo não encontrado' });
    }
  });
});

export default router;
