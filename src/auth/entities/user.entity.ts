import { Column, Entity, ObjectIdColumn, PrimaryColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('User')
export class User {
  @ObjectIdColumn()
  _id: ObjectId;

  @PrimaryColumn()
  carnet: string;

  @Column()
  nombre: string;

  @Column()
  correo: string;

  @Column()
  password: string;
}
