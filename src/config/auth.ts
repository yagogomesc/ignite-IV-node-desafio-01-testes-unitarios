export default {
  jwt: {
    secret: process.env.JWT_SECRET as string || 'supersenha',
    expiresIn: '1d'
  }
}
