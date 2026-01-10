import  Sequelize  from 'sequelize';

const DATABASE = process.env.DB_NAME;
const USERNAME = process.env.DB_USERNAME;
const PASSWORD = process.env.DB_PASSWORD;
const HOST = process.env.DB_HOST;
const PORT = process.env.DB_PORT;

const sequelize = new Sequelize(DATABASE, USERNAME, PASSWORD, {
  host: HOST,
  port: PORT,
  dialect: "mysql"
});

const connectDatabase = async ()=>{
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}
export {connectDatabase};
export default sequelize;