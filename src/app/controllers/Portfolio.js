import { Router } from 'express';
import Project from '../schemas/Project';

const router = new Router();

router.get('/',(req,res) => {
    Project.find().then(data => {
        const projects = data.map(project => {
            return {title: project.title, category: project.category};
        });
    res.send(projects);
    })
    .catch(error => {
        console.error('Erro ao obter dados do projeto no banco de dados',error);
        res
        .status(400)
        .send({
            error: 'Não foi possível obter os dados do seu projeto. Tente novamente!'
        });
    })
});
router.get('/id/:projectId', (req,res) => {
    Project.findById(req.params.projectId)
    .then(project => {
        res.send(project);
    })
    .catch(error => {
        console.error('Erro ao obter dados do projeto no banco de dados',error);
        res.status(400)
        .send({
            error: 'Não foi possível obter os dados do seu projeto. Tente novamente!'
        });
    });
});
router.get('/:projectSlug',(req,res) => {
    Project.findOne({slug: req.params.projectSlug})
    .then(project => {
        res.send(project);
    })
    .catch(error => {
        console.error('Erro ao obter dados do projeto no banco de dados',error);
        res
        .status(400)
        .send({
            error: 'Não foi possível obter os dados do seu projeto. Tente novamente!'
        });
    });

});

router.get('/teste', (req, res) => {
    Project.findOne({ title: req.body.title, description: req.body.description})
    .then(project => {
        res.send(project);
    })
    .catch(error => {
        console.error('Erro ao obter projeto no banco de dados', error);
        res
        .status(400)
        .send({
            error: 'Não foi possível obter os dados do projeto. Tente novamente!' 
        })
    });
});

router.post('/',(req,res) => {
    const {title, slug, description, category} = req.body;
    Project.create({title, slug, description, category}).then(project => {
        res.status(200).send(project);
    })
    .catch(error => {
        console.error('Erro ao salvar novo projeto no banco de dados',error);
        res
        .status(400)
        .send({
            error: 'Não foi possível salvar seu projeto. Verifique os dados e tente novamente'
        });
    })
});
router.put('/',(req,res) => {

});
router.delete('/',(req,res) => {

});
 
export default router; // exportando pra conseguir usar em outro lugar