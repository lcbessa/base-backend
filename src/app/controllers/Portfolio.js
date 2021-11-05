import { Router } from 'express';
import Project from '../schemas/Project';
import Slugify from '../../utils/Slugify';
import AuthMiddleware from '../middlewares/Auth';
import Multer from '../middlewares/Multer';

const router = new Router();

router.get('/', (req, res) => {
  Project.find()
    .then((data) => {
      const projects = data.map((project) => {
        return {
          title: project.title,
          category: project.category,
          slug: project.slug,
          featuredImage: project.featuredImage,
        };
      });
      res.send(projects);
    })
    .catch((error) => {
      console.error('Erro ao obter dados do projeto no banco de dados', error);
      res.status(400).send({
        error:
          'Não foi possível obter os dados do seu projeto. Tente novamente!',
      });
    });
});
router.get('/id/:projectId', (req, res) => {
  Project.findById(req.params.projectId)
    .then((project) => {
      res.send(project);
    })
    .catch((error) => {
      console.error('Erro ao obter dados do projeto no banco de dados', error);
      res.status(400).send({
        error:
          'Não foi possível obter os dados do seu projeto. Tente novamente!',
      });
    });
});
router.get('/:projectSlug', (req, res) => {
  Project.findOne({ slug: req.params.projectSlug })
    .then((project) => {
      res.send(project);
    })
    .catch((error) => {
      console.error('Erro ao obter dados do projeto no banco de dados', error);
      res.status(400).send({
        error:
          'Não foi possível obter os dados do seu projeto. Tente novamente!',
      });
    });
});

router.get('/teste', (req, res) => {
  Project.findOne({ title: req.body.title, description: req.body.description })
    .then((project) => {
      res.send(project);
    })
    .catch((error) => {
      console.error('Erro ao obter projeto no banco de dados', error);
      res.status(400).send({
        error: 'Não foi possível obter os dados do projeto. Tente novamente!',
      });
    });
});

router.post('/', AuthMiddleware, (req, res) => {
  const { title, slug, description, category } = req.body;
  Project.create({ title, slug, description, category })
    .then((project) => {
      res.status(200).send(project);
    })
    .catch((error) => {
      console.error('Erro ao salvar novo projeto no banco de dados', error);
      res.status(400).send({
        error:
          'Não foi possível salvar seu projeto. Verifique os dados e tente novamente',
      });
    });
});
router.put('/:projectId', AuthMiddleware, (req, res) => {
  const { title, description, category } = req.body;
  let slug = undefined;
  if (title) {
    slug = Slugify(title);
  }
  Project.findByIdAndUpdate(
    req.params.projectId,
    { title, slug, description, category },
    { new: true },
  )
    .then((project) => {
      res.status(200).send(project);
    })
    .catch((error) => {
      console.error('Erro ao atualizar novo projeto no banco de dados', error);
      res.status(400).send({
        error:
          'Não foi possível atualizar seu projeto. Verifique os dados e tente novamente',
      });
    });
});
router.delete('/:projectId', AuthMiddleware, (req, res) => {
  Project.findByIdAndRemove(req.params.projectId)
    .then(() => {
      res.send({ message: 'Projeto removido com sucesso!' });
    })
    .catch((error) => {
      console.error('Erro ao remover projeto do banco de dados', error);
      res
        .status(400)
        .send({ message: 'Erro ao remover o projeto, tente novamente' });
    });
});

router.post(
  '/featured-image/:projectId',
  [AuthMiddleware, Multer.single('featuredImage')],
  (req, res) => {
    const { file } = req;
    if (file) {
      Project.findByIdAndUpdate(
        req.params.projectId,
        {
          $set: {
            featuredImage: file.path,
          },
        },
        { new: true },
      )
        .then((project) => {
          return res.send({ project });
        })
        .catch((error) => {
          console.error('Erro ao associar imagem ao projeto', error);
          res.status(500).send({ error: 'Ocorreu um erro, tente novamente!' });
        });
    } else {
      return res.status(400).send({ error: 'Nenhuma imagem enviada' });
    }
  },
);
router.post('/images/:projectId', Multer.array('images'), (req, res) => {
  const { files } = req;

  if (files && files.length > 0) {
    const images = [];
    files.forEach((file) => {
      images.push(file.path);
    });
    Project.findByIdAndUpdate(
      req.params.projectId,
      {
        $set: { images },
      },
      { new: true },
    )
      .then((project) => {
        return res.send({ project });
      })
      .catch((error) => {
        console.error('Erro ao associar imagens ao projeto', error);
        res.status(500).send({ error: 'Ocorreu um erro, tente novamente!' });
      });
  } else {
    return res.status(400).send({ error: 'Nenhuma imagem enviada' });
  }
});
export default router; // exportando pra conseguir usar em outro lugar
