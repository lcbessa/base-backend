import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost/portfolio-pessoal', {
  useNewUrlparser: true,
  useUnifiedTopology: true,
});

mongoose.Promise = global.Promise; //usar funções assíncronas

export default mongoose;
