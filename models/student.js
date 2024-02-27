import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

const connection = await mysql.createConnection(config);

export class StudentModel {
  static async getById ({ cedula }) {
    const [student] = await connection.query(
      'SELECT st.nombres, st.cedula ' +
      'FROM student st ' +
      'LEFT JOIN estudiante_materia m ON st.cedula = m.cedula ' +
      'WHERE m.cedula = ;', [cedula]
    );

    if (student.length === 0 || student[0].id === null) {
      return null;
    }

    return student[0];
  }

  static async create ({ input }) {
    const {
      cedula,
      nombres
    } = input;

    try {
      await connection.query(
        'INSERT INTO student (cedula, nombres) ' +
        'VALUES (?, ?);',
        [cedula, nombres]
      );
    } catch (e) {
      throw new Error('Error creating a student');
    }
  }

  static async update ({ cedula, input }) {
    const validFields = ['npmbres'];
    const fieldsToUpdate = Object.entries(input)
      .filter(([key]) => validFields.includes(key))
      .map(([key, value]) => ({ key, value }));

    if (fieldsToUpdate.length === 0) {
      return null;
    }

    const setClause = fieldsToUpdate.map(field => `${field.key} = ?`).join(', ');
    const values = fieldsToUpdate.map(field => field.value);

    const query = `UPDATE student SET ${setClause} WHERE cedula = ?;`;
    values.push(cedula);

    try {
      await connection.query(query, values);
      const [updatedStudent] = await connection.query(
        'SELECT nombres' +
        'FROM student WHERE cedula = ;', [cedula]
      );

      return updatedStudent.length > 0 ? updatedStudent[0] : null;
    } catch (error) {
      return new Error('Algo ha salido mal!');
    }
  }

  static async delete ({ id }) {
    const result = await connection.query('DELETE FROM student WHERE cedula = (?);', [id]);
    return result[0].affectedRows > 0;
  }
}
