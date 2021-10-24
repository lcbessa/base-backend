import express from "express";
import { Router } from "express";

const app = express();
const port = 3000;

app.use(express.json()); // padronização de troca de dados
app.use(express.urlencoded({extended: false})); // segurança

const router = new Router();

router.get('/',(req,res) => {
    return res.status(200).send({message})
});

console.log(`Servidor rodando no link http://localhost:${port}`);
app.listen(port);

