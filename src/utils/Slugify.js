import slugify from 'slugify';

export default (str) => {
  return slugify(str, {
    // recebe a string
    lower: true, // deixar tudo minúsculo
    replacement: '-', // remove  espaço por -
    remove: /[\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]/g, // remove caracter especial
  });
};
